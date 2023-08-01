import httpStatus from 'http-status';
import APIError from '../helpers/apiErrorHelper.js';
import Project from './project.model.js';
import User from './user.model.js';


const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const projects = await Project.list({ limit, skip });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const {projectId} = req.params;
    const project = await Project.get(projectId);
    if (project) return res.json(project);
    const msg = `No such project ${projectId} ${project} exists!`;
    const err = new APIError(msg, httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    let alreadyHave = await Project.getByName(name);
    if(alreadyHave) return next(new APIError('The project already exists!', httpStatus.NOT_ACCEPTABLE));
    const project = new Project({ name });
    const savedProject= await project.save();
    return res.json(savedProject);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    let alreadyHave = await Project.getByName(name);
    if(alreadyHave) return next(new APIError('The project already exists!', httpStatus.NOT_ACCEPTABLE));
    
    const project = await Project.update(projectId, name);
    return res.json(project);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.get(projectId);
    
    
    if(project.numOfMembers!=0) return next(new APIError(`The project has  ${project.numOfMembers} members! \n You should move them to other project!`, httpStatus.NOT_ACCEPTABLE));
    //user db update add 해야함

    const result = await Project.delete(projectId);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

export default {
  list,
  get,
  create,
  update,
  remove
};
