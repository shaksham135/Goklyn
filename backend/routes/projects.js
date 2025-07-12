const router = require('express').Router();
const multer = require('multer');
const mongoose = require('mongoose');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Project = require('../models/project.model');
const { protect, isAdminOrSubAdmin, isAdmin } = require('../middleware/auth');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gollywood-portfolio/projects',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
    use_filename: true,
    unique_filename: false
  },
});

const upload = multer({ storage });

// --- API ROUTES ---

// @route   GET api/projects
// @desc    Get all projects
// @access  Public
router.route('/').get(async (req, res) => {
    console.log('GET /api/projects - Fetching all projects');
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        console.log(`Found ${projects.length} projects`);
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch projects',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
        });
    }
});

// @route   GET api/projects/:id
// @desc    Get a single project by ID
// @access  Public
router.route('/:id').get(async (req, res) => {
    const projectId = req.params.id;
    console.log(`GET /api/projects/${projectId} - Fetching project`);
    
    try {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            console.error(`Invalid project ID format: ${projectId}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format'
            });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            console.error(`Project not found with ID: ${projectId}`);
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        console.log(`Found project: ${project.title}`);
        res.json(project);
    } catch (err) {
        console.error(`Error fetching project ${projectId}:`, err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
        });
    }
});

// @route   POST api/projects
// @desc    Add a new project
// @access  Private (Admin/Sub-Admin only)
async function addProjectHandler(req, res) {
    console.log('Received body (add):', req.body);
    console.log('Received file (add):', req.file);
    try {
        const { title, description, projectUrl, githubUrl, tags } = req.body;

        const projectData = {
            title,
            description,
            projectUrl: projectUrl || '',
            githubUrl: githubUrl || '',
            tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : (Array.isArray(tags) ? tags : []),
        };

        // Handle file upload if present
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'gollywood-portfolio/projects',
                    transformation: [{ width: 800, height: 600, crop: 'limit' }]
                });
                
                projectData.photo = result.secure_url;
                projectData.photoPublicId = result.public_id;
                console.log('Photo uploaded successfully:', { 
                    url: result.secure_url, 
                    publicId: result.public_id 
                });
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error uploading image',
                    error: uploadError.message 
                });
            }
        }
        
        const newProject = new Project(projectData);

        await newProject.save();
        res.status(201).json({ msg: 'Project added successfully!', project: newProject });

    } catch (err) {
        console.error('Error adding project:', err);
        res.status(500).json({ msg: 'Server error while adding project.' });
    }
};

// Handle both /projects and /projects/add with authentication and authorization
router.post('/', protect, isAdminOrSubAdmin, upload.single('photo'), addProjectHandler);
router.post('/add', protect, isAdminOrSubAdmin, upload.single('photo'), addProjectHandler);

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private (Admin/Sub-Admin only)
router.put('/:id', protect, isAdminOrSubAdmin, upload.single('photo'), async (req, res) => {
    console.log('Received body (update):', req.body);
    console.log('Received file (update):', req.file);
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Update project data from request body
        const { title, description, projectUrl, githubUrl, tags } = req.body;
        const updateData = {
            title: title || project.title,
            description: description || project.description,
            projectUrl: projectUrl || project.projectUrl || '',
            githubUrl: githubUrl || project.githubUrl || '',
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : project.tags || []
        };

        // Handle file upload if a new photo is provided
        if (req.file) {
            try {
                // If there was a previous photo, delete it from Cloudinary
                if (project.photoPublicId) {
                    await cloudinary.uploader.destroy(project.photoPublicId);
                }
                
                // Upload new photo
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'gollywood-portfolio/projects',
                    transformation: [{ width: 800, height: 600, crop: 'limit' }]
                });
                
                // Add new photo data to update
                updateData.photo = result.secure_url;
                updateData.photoPublicId = result.public_id;
                
                console.log('Updated project photo:', {
                    url: result.secure_url,
                    publicId: result.public_id
                });
            } catch (uploadError) {
                console.error('Error updating project photo:', uploadError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error updating project photo',
                    error: uploadError.message 
                });
            }
        }
        
        // Update the project with all data
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ success: false, message: 'Project not found after update' });
        }

        res.json({ 
            success: true, 
            message: 'Project updated successfully', 
            project: updatedProject 
        });
    } catch (err) {
        console.error('Error updating project:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating project',
            error: err.message 
        });
    }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private (Admin only - only admins can delete)
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // If the project has a photo, delete it from Cloudinary
        if (project.photoPublicId) {
            await cloudinary.uploader.destroy(project.photoPublicId);
        }

        await Project.findByIdAndDelete(req.params.id);
        
        res.json({ msg: 'Project deleted successfully.' });

    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ msg: 'Server error while deleting project.' });
    }
});

module.exports = router;
