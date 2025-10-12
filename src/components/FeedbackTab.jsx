import React from 'react'

export default function FeedbackTab() {
  return (
    <button
      type="button"
  className="fixed right-0 top-1/2 -translate-y-1/2 translate-x-10 -rotate-90 origin-right bg-[#E60012] text-white px-4 py-2 rounded-t-lg shadow-card hover:brightness-110"
      onClick={() => alert('Feedback')}
    >
      Feedback
    </button>
  )
}