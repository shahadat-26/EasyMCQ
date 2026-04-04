using EasyMCQ.Models;
using Microsoft.EntityFrameworkCore;

namespace EasyMCQ.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Option> Options { get; set; }
        public DbSet<StudentExam> StudentExams { get; set; }
        public DbSet<StudentAnswer> StudentAnswers { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Role).HasConversion<string>();
                entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone");
            });

            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasOne(c => c.Teacher)
                    .WithMany(u => u.TeacherCourses)
                    .HasForeignKey(c => c.TeacherId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone");
            });

            modelBuilder.Entity<Enrollment>(entity =>
            {
                entity.HasOne(e => e.Student)
                    .WithMany(u => u.StudentEnrollments)
                    .HasForeignKey(e => e.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Course)
                    .WithMany(c => c.Enrollments)
                    .HasForeignKey(e => e.CourseId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.StudentId, e.CourseId }).IsUnique();
                entity.Property(e => e.EnrolledAt).HasColumnType("timestamp without time zone");
            });

            modelBuilder.Entity<Exam>(entity =>
            {
                entity.HasOne(e => e.Course)
                    .WithMany(c => c.Exams)
                    .HasForeignKey(e => e.CourseId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.ScheduledStartTime).HasColumnType("timestamp without time zone");
                entity.Property(e => e.ScheduledEndTime).HasColumnType("timestamp without time zone");
                entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone");
            });

            modelBuilder.Entity<Question>(entity =>
            {
                entity.HasOne(q => q.Exam)
                    .WithMany(e => e.Questions)
                    .HasForeignKey(q => q.ExamId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Option>(entity =>
            {
                entity.HasOne(o => o.Question)
                    .WithMany(q => q.Options)
                    .HasForeignKey(o => o.QuestionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<StudentExam>(entity =>
            {
                entity.HasOne(se => se.Student)
                    .WithMany(u => u.StudentExams)
                    .HasForeignKey(se => se.StudentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(se => se.Exam)
                    .WithMany(e => e.StudentExams)
                    .HasForeignKey(se => se.ExamId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.StudentId, e.ExamId }).IsUnique();
                entity.Property(e => e.Status).HasConversion<string>();
                entity.Property(e => e.StartedAt).HasColumnType("timestamp without time zone");
                entity.Property(e => e.SubmittedAt).HasColumnType("timestamp without time zone");
            });

            modelBuilder.Entity<StudentAnswer>(entity =>
            {
                entity.HasOne(sa => sa.StudentExam)
                    .WithMany(se => se.StudentAnswers)
                    .HasForeignKey(sa => sa.StudentExamId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(sa => sa.Question)
                    .WithMany(q => q.StudentAnswers)
                    .HasForeignKey(sa => sa.QuestionId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(sa => sa.SelectedOption)
                    .WithMany()
                    .HasForeignKey(sa => sa.SelectedOptionId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasOne(n => n.User)
                    .WithMany(u => u.Notifications)
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.Type).HasConversion<string>();
                entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone");
                entity.Property(e => e.ReadAt).HasColumnType("timestamp without time zone");
            });
        }
    }
}