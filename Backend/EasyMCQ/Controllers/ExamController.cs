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
    public class ExamController : ControllerBase
    {
        private readonly IExamService _examService;

        public ExamController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpPost("create")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateExam([FromBody] CreateExamDto dto)
        {
            var teacherId = GetUserId();
            var result = await _examService.CreateExamAsync(dto, teacherId);
            if (result == null)
                return BadRequest(new { message = "Failed to create exam" });

            return Ok(result);
        }

        [HttpPost("{examId}/publish")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> PublishExam(int examId)
        {
            var teacherId = GetUserId();
            var result = await _examService.PublishExamAsync(examId, teacherId);
            if (!result)
                return BadRequest(new { message = "Failed to publish exam" });

            return Ok(new { message = "Exam published successfully" });
        }

        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetCourseExams(int courseId)
        {
            var userId = GetUserId();
            var userRole = GetUserRole();
            var exams = await _examService.GetCourseExamsAsync(courseId, userId, userRole);
            return Ok(exams);
        }

        [HttpPost("{examId}/start")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> StartExam(int examId)
        {
            var studentId = GetUserId();
            var result = await _examService.StartExamAsync(examId, studentId);
            if (!result)
                return BadRequest(new { message = "Cannot start exam. Check if you're enrolled and within scheduled time." });

            return Ok(new { message = "Exam started successfully" });
        }

        [HttpGet("{examId}/details")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetExamDetails(int examId)
        {
            var studentId = GetUserId();
            var result = await _examService.GetExamDetailsAsync(examId, studentId);
            if (result == null)
                return BadRequest(new { message = "Exam not started or already submitted" });

            return Ok(result);
        }

        [HttpPost("{examId}/submit")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitExam(int examId, [FromBody] SubmitExamDto dto)
        {
            var studentId = GetUserId();
            var result = await _examService.SubmitExamAsync(examId, studentId, dto);
            if (result == null)
                return BadRequest(new { message = "Failed to submit exam" });

            return Ok(result);
        }

        [HttpGet("{examId}/result")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetExamResult(int examId)
        {
            var studentId = GetUserId();
            var result = await _examService.GetExamResultAsync(examId, studentId);
            if (result == null)
                return NotFound(new { message = "Result not found" });

            return Ok(result);
        }

        [HttpGet("{examId}/all-results")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetAllExamResults(int examId)
        {
            var teacherId = GetUserId();
            var results = await _examService.GetAllExamResultsAsync(examId, teacherId);
            if (results == null)
                return BadRequest(new { message = "Unauthorized or exam not found" });

            return Ok(results);
        }

        [HttpGet("student/{studentId}/course/{courseId}/results")]
        [Authorize(Roles = "Teacher,Student")]
        public async Task<IActionResult> GetStudentCourseResults(int studentId, int courseId)
        {
            var userId = GetUserId();
            var userRole = GetUserRole();

            if (userRole == UserRole.Student && userId != studentId)
                return Unauthorized(new { message = "Students can only view their own results" });

            var results = await _examService.GetStudentCourseResultsAsync(studentId, courseId);
            return Ok(results);
        }

        [HttpGet("course/{courseId}/statistics")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetCourseStatistics(int courseId)
        {
            var teacherId = GetUserId();
            var stats = await _examService.GetCourseStatisticsAsync(courseId, teacherId);
            if (stats == null)
                return BadRequest(new { message = "Unauthorized or course not found" });

            return Ok(stats);
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        private UserRole GetUserRole()
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            return Enum.Parse<UserRole>(roleClaim ?? "Student");
        }
    }
}