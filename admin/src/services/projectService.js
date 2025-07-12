import api from '../api';

const PROJECT_ENDPOINT = '/projects';

/**
 * A service for interacting with the projects API.
 */
const projectService = {
  /**
   * Fetches all projects from the backend.
   * @returns {Promise<Array>} A promise that resolves to an array of projects.
   */
  async getProjects() {
    try {
      console.log('Attempting to fetch projects...');
      const response = await api.get(PROJECT_ENDPOINT);
      
      // The response now contains the full response object
      const data = response.data?.data || response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        console.log('Successfully fetched projects:', data);
        return data;
      } else if (data && Array.isArray(data.projects)) {
        console.log('Successfully fetched projects from data.projects:', data.projects);
        return data.projects;
      }
      
      // If we get here, the API response was not in the expected format
      console.warn('API did not return an array for projects. Response:', response.data);
      // Return an empty array to prevent the UI from crashing
      return [];

    } catch (error) {
      // The error will be thrown by the axios interceptor if the request fails
      console.error('A critical error occurred while fetching projects:', error);
      // Re-throw the error so the calling component (ProjectsPage) can handle it.
      throw error;
    }
  },

  /**
   * Fetches a single project by its ID.
   * @param {string} id The ID of the project to fetch.
   * @returns {Promise<Object>} A promise that resolves to the project object.
   */
  async getProjectById(id) {
    try {
      const response = await api.get(`${PROJECT_ENDPOINT}/${id}`);
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Creates a new project.
   * @param {Object} projectData The project data.
   * @returns {Promise<Object>} A promise that resolves to the newly created project.
   */
  async createProject(projectData) {
    try {
      const response = await api.post(PROJECT_ENDPOINT, projectData);
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Updates an existing project.
   * @param {string} id The ID of the project to update.
   * @param {Object} projectData The updated project data.
   * @returns {Promise<Object>} A promise that resolves to the updated project.
   */
  async updateProject(id, projectData) {
    try {
      const response = await api.put(`${PROJECT_ENDPOINT}/${id}`, projectData);
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Deletes a project by its ID.
   * @param {string} id The ID of the project to delete.
   * @returns {Promise<Object>} A promise that resolves to the confirmation message.
   */
  async deleteProject(id) {
    try {
      const response = await api.delete(`${PROJECT_ENDPOINT}/${id}`);
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
};

export default projectService;

