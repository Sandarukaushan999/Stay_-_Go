import { IssueReport } from "../models/IssueReport.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { env } from "../../config/env.js";

// POST /api/roommate/issues
export const createIssue = async (req, res, next) => {
  try {
    const {
      category,
      title,
      description,
      priority,
      roomNumber,
      additionalNotes,
    } = req.body;

    if (!title) throw new ApiError(400, "Title is required");
    if (!description) throw new ApiError(400, "Description is required");
    if (!category) throw new ApiError(400, "Category is required");

    // Handle optional file upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/issues/${req.file.filename}`;
    }

    const issue = await IssueReport.create({
      reportedBy: req.user.id,
      category,
      title,
      description,
      priority: priority || "MEDIUM",
      roomNumber: roomNumber || null,
      additionalNotes: additionalNotes || null,
      imageUrl,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Issue reported successfully",
        data: issue,
      });
  } catch (err) {
    next(err);
  }
};

// GET /api/roommate/issues/me — student's own issues
export const getMyIssues = async (req, res, next) => {
  try {
    const issues = await IssueReport.find({ reportedBy: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, message: "Issues retrieved", data: issues });
  } catch (err) {
    next(err);
  }
};

// GET /api/roommate/issues — admin: all issues
export const getAllIssues = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const issues = await IssueReport.find(filter)
      .populate("reportedBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await IssueReport.countDocuments(filter);

    res.json({
      success: true,
      message: "Issues retrieved",
      data: {
        issues,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/roommate/issues/:id
export const getIssueById = async (req, res, next) => {
  try {
    const issue = await IssueReport.findById(req.params.id).populate(
      "reportedBy",
      "fullName email",
    );

    if (!issue) throw new ApiError(404, "Issue not found");

    res.json({ success: true, message: "Issue retrieved", data: issue });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/roommate/issues/:id/status — admin
export const updateIssueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) throw new ApiError(400, "Status is required");

    const issue = await IssueReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!issue) throw new ApiError(404, "Issue not found");

    res.json({ success: true, message: "Issue status updated", data: issue });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/roommate/issues/:id/comment — admin
export const addAdminComment = async (req, res, next) => {
  try {
    const { adminComment } = req.body;
    if (!adminComment) throw new ApiError(400, "Comment is required");

    const issue = await IssueReport.findByIdAndUpdate(
      req.params.id,
      { adminComment },
      { new: true },
    );

    if (!issue) throw new ApiError(404, "Issue not found");

    res.json({ success: true, message: "Comment added", data: issue });
  } catch (err) {
    next(err);
  }
};
