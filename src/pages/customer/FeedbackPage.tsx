import { useState, FormEvent } from 'react';
import { Star, StarHalf, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const FeedbackPage = () => {
  const [jobId, setJobId] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};

    if (!jobId.trim()) {
      newErrors.jobId = 'Job ID is required';
    } else if (!/^\d+$/.test(jobId)) {
      newErrors.jobId = 'Please enter a valid Job ID (positive number only)';
    }

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!feedback.trim()) {
      newErrors.feedback = 'Please provide your feedback';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    setErrors({});
    setIsLoading(true);

    try {
      const payload = {
        feedback,
        rating,
      };

      const response = await axios.put(
        `http://localhost:5000/api/jobs/updateFeedback/${jobId}`,
        payload
      );

      //console.log('Feedback updated successfully:', response.data);
      setIsSubmitted(true);

      // Reset form
      setJobId('');
      setRating(0);
      setFeedback('');
    } catch (error: any) {
      console.error('Error updating feedback:', error);
      setErrors({ general: error.response?.data?.message || 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleMouseEnter = (value: number) => {
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const renderStars = () => {
    const stars = [];
    const activeRating = hoverRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-2xl focus:outline-none transition ${
            i <= activeRating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          aria-label={`Rate ${i} stars`}
        >
          <Star className="w-8 h-8 fill-current" />
        </button>
      );
    }

    return stars;
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Share Your Feedback</h1>
        <p className="text-gray-600 mb-8">
          We value your opinion and would love to hear about your experience with our service.
        </p>

        {isSubmitted ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate you taking the time to share your experience with us.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-primary"
            >
              Submit Another Feedback
            </button>
          </div>
        ) : (
          <div className="card p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="label" htmlFor="jobId">
                    Job ID
                  </label>
                  <input
                    type="text"
                    id="jobId"
                    placeholder="e.g., JOB-1234"
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className={`input ${errors.jobId ? 'border-red-500' : ''}`}
                  />
                  {errors.jobId && <p className="mt-2 text-sm text-red-600">{errors.jobId}</p>}
                </div>

                <div>
                  <label className="label">
                    How would you rate our service?
                  </label>
                  <div className="flex space-x-2">
                    {renderStars()}
                  </div>
                  {errors.rating && <p className="mt-2 text-sm text-red-600">{errors.rating}</p>}
                </div>

                <div>
                  <label className="label" htmlFor="feedback">
                    Your Feedback
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    placeholder="Please share your experience, suggestions, or concerns..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className={`input resize-none ${errors.feedback ? 'border-red-500' : ''}`}
                  ></textarea>
                  {errors.feedback && <p className="mt-2 text-sm text-red-600">{errors.feedback}</p>}
                </div>


                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;