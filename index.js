const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/jobPortal", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  location: { type: String, required: true },
  remote: { type: Boolean, default: false },
  employmentType: { type: String, required: true },
  description: { type: String, required: true },
  applicationEmail: { type: String, required: true },
  salary: { type: String, default: "Not specified" },
  companyName: { type: String, required: true },
  tagline: { type: String, default: "" },
  logo: { type: String, default: "" },
  jobCategory: { type: String, required: true },
  postedAt: { type: Date, default: Date.now },
});

const Job = mongoose.model("Job", jobSchema);


const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 2 * 1024 * 1024 },
});


app.get("/api/jobs", async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) {
      query.jobCategory = category;
    }

    const jobs = await Job.find(query);
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/jobs", upload.single("logo"), async (req, res) => {
  try {
    const newJob = new Job({
      jobTitle: req.body.jobTitle,
      location: req.body.location,
      remote: req.body.remote === "true",
      employmentType: req.body.employmentType,
      description: req.body.description,
      applicationEmail: req.body.applicationEmail,
      salary: req.body.salary,
      companyName: req.body.companyName,
      tagline: req.body.tagline,
      logo: req.file ? req.file.filename : "",
      jobCategory: req.body.jobCategory,
    });

    const savedJob = await newJob.save();
    res.status(201).json({ message: "Job posted successfully", job: savedJob });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.put("/api/jobs/:id", upload.single("logo"), async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        jobTitle: req.body.jobTitle,
        location: req.body.location,
        remote: req.body.remote === "true",
        employmentType: req.body.employmentType,
        description: req.body.description,
        applicationEmail: req.body.applicationEmail,
        salary: req.body.salary,
        companyName: req.body.companyName,
        tagline: req.body.tagline,
        logo: req.file ? req.file.filename : req.body.logo,
        jobCategory: req.body.jobCategory,
      },
      { new: true, runValidators: true }
    );

    if (!updatedJob) return res.status(404).json({ error: "Job not found" });
    res.status(200).json({ message: "Job updated successfully", job: updatedJob });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ error: "Job not found" });
    res.status(200).json({ message: "Job deleted successfully", job: deletedJob });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
