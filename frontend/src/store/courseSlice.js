import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api.js';

const initialState = {
  courses: [],
  enrolledCourses: [],
  instructorCourses: [],
  currentCourse: null,
  page: 1,
  pages: 1,
  total: 0,
  loading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async ({ page = 1, search = '', instructor = '' } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/courses?page=${page}&search=${search}&instructor=${instructor}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      return data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course details');
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enroll',
  async (courseId, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post(`/courses/${courseId}/enroll`);
      dispatch(fetchCourseById(courseId)); // Refresh current course details
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Enrollment failed');
    }
  }
);

export const completeCourseLesson = createAsyncThunk(
  'courses/completeLesson',
  async ({ courseId, lessonId }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/courses/${courseId}/lessons/${lessonId}/complete`);
      return data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record lesson completion');
    }
  }
);

export const createNewCourse = createAsyncThunk(
  'courses/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course');
    }
  }
);

export const updateExistingCourse = createAsyncThunk(
  'courses/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/courses/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.course;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course');
    }
  }
);

export const deleteCourseById = createAsyncThunk(
  'courses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
    }
  }
);

export const fetchEnrolledCourses = createAsyncThunk(
  'courses/fetchEnrolled',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/courses/enrolled/me');
      return data.courses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrolled courses');
    }
  }
);

export const fetchInstructorCourses = createAsyncThunk(
  'courses/fetchInstructor',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/courses/instructor/me');
      return data.courses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch instructor courses');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCourseError: (state) => {
      state.error = null;
    },
    resetCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete Lesson
      .addCase(completeCourseLesson.fulfilled, (state, action) => {
        state.currentCourse = action.payload;
      })
      // Fetch Enrolled
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.enrolledCourses = action.payload;
      })
      // Fetch Instructor Courses
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.instructorCourses = action.payload;
      })
      // Delete Course
      .addCase(deleteCourseById.fulfilled, (state, action) => {
        state.courses = state.courses.filter((c) => c._id !== action.payload);
        state.instructorCourses = state.instructorCourses.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearCourseError, resetCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
