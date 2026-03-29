const express = require('express');
const router = express.Router();
const fs = require('fs');
const auth = require('../middleware/auth');
const Scan = require('../models/Scan');
const { spawn } = require('child_process');
const path = require('path');

// Get all scans for user
router.get('/', auth, async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get scan by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan || scan.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Scan not found' });
    }
    res.json(scan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Start a new scan
router.post('/start', auth, async (req, res) => {
  const { targetUrl } = req.body;

  if (!targetUrl) {
    return res.status(400).json({ message: 'Target URL is required' });
  }

  try {
    const scan = new Scan({
      user: req.user.id,
      targetUrl,
      status: 'running'
    });
    await scan.save();

    // Respond immediately
    res.json(scan);

    // Get socket.io instance
    const io = req.app.get('io');

    // Spawn Python scanner
    const scannerDir = path.join(__dirname, '../../scanner');
    let pythonCmd = 'python';
    const venvPython = path.join(__dirname, '../../.venv/Scripts/python.exe');
    if (fs.existsSync(venvPython)) {
      pythonCmd = venvPython;
    }

    // Emit scan started
    io.emit('scan:progress', { scanId: scan._id, status: 'running', progress: 10, message: 'Initializing scanner...' });

    const pythonProcess = spawn(pythonCmd, ['main.py', JSON.stringify({ target: targetUrl })], { cwd: scannerDir });

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      io.emit('scan:progress', { scanId: scan._id, status: 'running', progress: 50, message: 'Scanning target...' });
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
      io.emit('scan:progress', { scanId: scan._id, status: 'running', progress: 40, message: 'Processing modules...' });
    });

    pythonProcess.on('close', async (code) => {
      try {
        if (code === 0 && output) {
          const results = JSON.parse(output);
          scan.vulnerabilities = results.vulnerabilities || [];
          scan.riskLevel = calculateRisk(scan.vulnerabilities);
          scan.status = 'completed';
        } else {
          scan.status = 'failed';
        }
        scan.completedAt = new Date();
        await scan.save();
        io.emit('scan:progress', { scanId: scan._id, status: scan.status, progress: 100, message: 'Scan complete!' });
        io.emit('scan:completed', scan);
      } catch (err) {
        console.error('Failed to parse scanner output or save scan', err);
        scan.status = 'failed';
        await scan.save();
        io.emit('scan:progress', { scanId: scan._id, status: 'failed', progress: 100, message: 'Scan failed.' });
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

function calculateRisk(vulns) {
  if (vulns.some(v => v.severity === 'Critical')) return 'Critical';
  if (vulns.some(v => v.severity === 'High')) return 'High';
  if (vulns.some(v => v.severity === 'Medium')) return 'Medium';
  if (vulns.length > 0) return 'Low';
  return 'Secure';
}

module.exports = router;
