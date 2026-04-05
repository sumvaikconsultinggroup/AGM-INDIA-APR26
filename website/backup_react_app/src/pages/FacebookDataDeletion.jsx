import React from 'react';

const FacebookDataDeletion = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Facebook Data Deletion Request
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              If you have used Facebook Login on our website/app and wish to delete your account and related data, please follow the steps below:
            </p>

            <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Send us an email at:</strong>{' '}
                <a
                  href="mailto:office@avdheshanandg.org"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  office@avdheshanandg.org
                </a>
              </li>
              <li>
                <strong>Use the subject:</strong> "Facebook Data Deletion Request"
              </li>
              <li>
                <strong>Include your Facebook Name and Email in the message.</strong>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> We will process your request and delete all associated data within 7 working days.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookDataDeletion;
