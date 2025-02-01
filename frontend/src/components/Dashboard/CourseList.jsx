import React from "react";

const courses = [
  { id: 1, name: "Coptic Hymns 101" },
  { id: 2, name: "Sunday School Teaching" },
  { id: 3, name: "Theology Basics" },
];

const CourseList = () => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Your Courses</h3>
      <ul>
        {courses.map((course) => (
          <li key={course.id} className="p-3 border-b">
            {course.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseList;
