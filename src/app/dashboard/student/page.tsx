export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, Alex</h1>
            <p className="text-gray-500">Computer Science Major • Target Role: Frontend Developer</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-1">
              Industry Readiness: 65%
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Roadmap Timeline */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Your Personalized Career Roadmap</h2>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                
                {/* Milestone 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-green-200 bg-green-50 shadow-sm">
                    <h3 className="font-bold text-gray-900">HTML, CSS, & Basics</h3>
                    <p className="text-sm text-gray-600 mb-2">Completed</p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-blue-200 bg-blue-50 shadow-sm">
                    <h3 className="font-bold text-gray-900">React.js & State Management</h3>
                    <p className="text-sm text-gray-600 mb-2">In Progress (Expected completion: 2 weeks)</p>
                    <button className="text-sm bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm hover:bg-gray-50">View Recommended Courses</button>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-200 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                    <h3 className="font-bold text-gray-900 text-opacity-50">Next.js & Full-stack Basics</h3>
                    <p className="text-sm text-gray-500 mb-2">Up Next</p>
                  </div>
                </div>

              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Skill Gap Analysis */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Identified Skill Gaps</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="w-2 h-2 mt-2 mr-2 rounded-full bg-red-400 shrink-0"></span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Next.js Server Actions</p>
                    <p className="text-xs text-gray-500">Required by 85% of target roles</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 mt-2 mr-2 rounded-full bg-yellow-400 shrink-0"></span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tailwind CSS Advanced</p>
                    <p className="text-xs text-gray-500">Required by 60% of target roles</p>
                  </div>
                </li>
              </ul>
              <button className="mt-4 w-full text-sm bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Browse Recommended Courses
              </button>
            </section>

            {/* Feedback & Placements */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Feedback</h2>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-orange-800 uppercase">Mock Interview</span>
                  <span className="text-xs text-orange-600">2 days ago</span>
                </div>
                <p className="text-sm text-gray-800">&ldquo;Good grasp of React fundamentals. Needs work on explaining state management architectural decisions clearly.&rdquo;</p>
                <p className="text-xs text-gray-500 mt-2">— Tech Corp Recruiter</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
