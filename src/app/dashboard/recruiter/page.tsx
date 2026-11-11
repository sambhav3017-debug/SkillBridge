export default function RecruiterDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Portal: Candidate Feedback</h1>
          <p className="text-gray-500">Provide structured feedback to help students bridge the gap to industry standards.</p>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Submit Feedback for Candidate</h2>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-2" placeholder="e.g., Alex Johnson" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interaction Type</label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option>Mock Interview</option>
                  <option>Internship Evaluation</option>
                  <option>Final Interview</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technical Skills Assessment (1-5)</label>
              <div className="flex gap-4 items-center">
                <input type="range" min="1" max="5" className="w-full" />
                <span className="text-sm font-medium w-8 text-center bg-gray-100 rounded py-1">3</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identified Skill Gaps</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-2 h-24" placeholder="What specific technologies or concepts is the candidate lacking?"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Constructive Feedback / Recommendations</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-2 h-24" placeholder="How can the candidate improve before becoming industry-ready?"></textarea>
            </div>

            <div className="flex justify-end">
              <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Submit Feedback to Candidate&apos;s Roadmap
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
