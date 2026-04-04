using EasyMCQ.DTOs;
using EasyMCQ.Models;
using EasyMCQ.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EasyMCQ.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpPost("create")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
        {
            var teacherId = GetUserId();
            var result = await _courseService.CreateCourseAsync(dto, teacherId);
            if (result == null)
                return BadRequest(new { message = "Failed to create course" });

            return Ok(result);
        }

        [HttpGet("teacher")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetTeacherCourses()
        {
            var teacherId = GetUserId();
            var courses = await _courseService.GetTeacherCoursesAsync(teacherId);
            return Ok(courses);
        }

        [HttpGet("available")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetAvailableCourses()
        {
            var studentId = GetUserId();
            var courses = await _courseService.GetAvailableCoursesAsync(studentId);
            return Ok(courses);
        }

        [HttpGet("enrolled")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetEnrolledCourses()
        {
            var studentId = GetUserId();
            var courses = await _courseService.GetEnrolledCoursesAsync(studentId);
            return Ok(courses);
        }

        [HttpPost("enroll")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> EnrollInCourse([FromBody] EnrollmentDto dto)
        {
            var studentId = GetUserId();
            var result = await _courseService.EnrollStudentAsync(studentId, dto.CourseId);
            if (!result)
                return BadRequest(new { message = "Already enrolled or invalid course" });

            return Ok(new { message = "Enrolled successfully" });
        }

        [HttpGet("{courseId}/students")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetCourseStudents(int courseId)
        {
            var teacherId = GetUserId();
            var students = await _courseService.GetCourseStudentsAsync(courseId, teacherId);
            return Ok(students);
        }

        [HttpGet("{courseId}")]
        [Authorize]
        public async Task<IActionResult> GetCourseDetails(int courseId)
        {
            var userId = GetUserId();
            var course = await _courseService.GetCourseDetailsAsync(courseId, userId);
            if (course == null)
                return NotFound(new { message = "Course not found" });

            return Ok(course);
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }
    }
}