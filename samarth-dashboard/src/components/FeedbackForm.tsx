import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Send, CheckCircle } from "lucide-react";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    district: "",
    officer_name: "",
    feedback_type: "compliment" as "compliment" | "complaint" | "suggestion",
    message: "",
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const now = new Date();
      await addDoc(collection(db, "feedback"), {
        district: formData.district || undefined,
        officer_name: formData.officer_name || undefined,
        feedback_type: formData.feedback_type,
        message: formData.message,
        rating: formData.rating.toString(), 
        submitted_at: now.toISOString(),
        status: "pending",
        feedback_text: formData.message,
        date: now.toLocaleString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        }),
      });

      setSubmitted(true);
      setFormData({
        district: "",
        officer_name: "",
        feedback_type: "compliment",
        message: "",
        rating: 5,
      });
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(err?.message ?? "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Thank you for your feedback!
        </h3>
        <p className="text-green-600 dark:text-green-300">
          Your feedback has been submitted successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Public Feedback Form
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Share your feedback, compliments, or suggestions about police services in your district.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District (Optional)
            </label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter district name"
            />
          </div>

          <div>
            <label htmlFor="officer_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Officer Name (Optional)
            </label>
            <input
              type="text"
              id="officer_name"
              name="officer_name"
              value={formData.officer_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter officer name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="feedback_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feedback Type
          </label>
          <select
            id="feedback_type"
            name="feedback_type"
            value={formData.feedback_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="compliment">Compliment</option>
            <option value="complaint">Complaint</option>
            <option value="suggestion">Suggestion</option>
          </select>
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rating: {formData.rating} {formData.rating === 5 ? "⭐⭐⭐⭐⭐" : formData.rating === 4 ? "⭐⭐⭐⭐" : formData.rating === 3 ? "⭐⭐⭐" : formData.rating === 2 ? "⭐⭐" : "⭐"}
          </label>
          <input
            type="range"
            id="rating"
            name="rating"
            min="1"
            max="5"
            value={formData.rating}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 (Poor)</span>
            <span>5 (Excellent)</span>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your feedback message..."
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !formData.message.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}

