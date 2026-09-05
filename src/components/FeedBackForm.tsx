import { useFeedBackService } from "@/services/feedback.service";
import { X } from "lucide-react";
import React, { useState } from "react";

const FeedBackForm = ({ onClick }: { onClick?: () => void }) => {
  const [description, setDescription] = useState("");
  const [identifier, setIdentifier] = useState("");
  const { save } = useFeedBackService();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveFeedBack();
    onClick()
  };
  const saveFeedBack = async () => {
    const body = {
      description: description,
      identifier: identifier,
    };
    await save(body);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 space-y-5"
    >
      <X onClick={onClick}/>
      <h2 className="text-2xl font-semibold text-gray-800">Send Feedback</h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter your feedback..."
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Identifier
        </label>

        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter identifier..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
      >
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedBackForm;
