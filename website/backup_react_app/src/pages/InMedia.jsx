// import { ExternalLink } from "lucide-react";
// import React, { useState } from "react";

// const InMedia = () => {
//   const articles = [
//     {
//       id: 1,
//       title: "Acharya Prashant’s Foundation saves 1 million animals in 2024",
//       description:
//         "In 2024, PrashantAdvait Foundation (PAF) achieved a unique milestone by saving one million animals by inspiring 50,000+ families to quit animal-based food. With Acharya Prashant’s wisdom, PAF connects spirituality with animal welfare & fosters compassion & sustainability.",
//       image:
//         "https://cimg.acharyaprashant.org/images/img-4296540b-edd0-44a6-bdad-8e649b640fd1/30/image.jpg",
//       source: "Inshorts",
//       date: "December 31, 2024",
//     },
//     {
//       id: 2,
//       title:
//         "Redefining Education: How PAF's Free Books Distribution Drives Are Shaping the Next Generation",
//       description:
//         "The Free Press Journal covered PrashantAdvait Foundation’s initiative to distribute free books in schools and colleges across India, redefining education by blending spirituality with scientific inquiry.",
//       image:
//         "https://cimg.acharyaprashant.org/images/img-4ed0f623-ad93-471d-aa89-c576f7774b6e/30/image.jpg",
//       source: "The Free Press Journal",
//       date: "December 30, 2024",
//     },
//   ];

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 2;

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentArticles = articles.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(articles.length / itemsPerPage);

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage((prev) => prev + 1);
//     }
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage((prev) => prev - 1);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-16 lg:px-24">
//       <h1 className="text-4xl font-bold text-center mb-8">
//         Media and Public Interaction
//       </h1>
//       <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
//         Here is the comprehensive list of articles published by prestigious top
//         media houses and renowned national dailies, based on Acharya Prashant’s
//         teachings.
//       </p>

//       <div className="h-[700px] w-3/4 m-auto grid grid-cols-1 gap-6">
//         {articles.map((article) => (
//           <div
//             key={article.id}
//             className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden"
//           >
//             {/* Image Section */}
//             <img
//               src={article.image}
//               alt={article.title}
//               className="w-full md:w-1/3 object-cover"
//             />

//             {/* Content Section */}
//             <div className="p-6 flex flex-col justify-between">
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {article.title}
//                 </h2>
//                 <p className="text-gray-600 mt-2">{article.description}</p>
//               </div>
//               <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
//                 <span>
//                   {article.source} - {article.date}
//                 </span>
//                 <button className="inline-flex items-right gap-2 px-4 py-2 text-sm border border-gray-300 rounded-full  transition-colors  hover:border-orange-500 hover:text-orange-500 group">
//                   Full Coverage
//                   <ExternalLink size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}

//         <div className="mt-8 flex justify-between items-center text-gray-700">
//           <p>
//             Showing {indexOfFirstItem + 1} to{" "}
//             {Math.min(indexOfLastItem, articles.length)} of {articles.length}{" "}
//             results
//           </p>
//           <div className="flex gap-4">
//             <button
//               onClick={handlePreviousPage}
//               disabled={currentPage === 1}
//               className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Previous
//             </button>
//             <button
//               onClick={handleNextPage}
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InMedia;

import { ExternalLink } from "lucide-react";
import { useState } from "react";

const InMedia = () => {
  const articles = [
    {
      id: 1,
      title: "Acharya Prashant’s Foundation saves 1 million animals in 2024",
      description:
        "In 2024, PrashantAdvait Foundation (PAF) achieved a unique milestone by saving one million animals by inspiring 50,000+ families to quit animal-based food. With Acharya Prashant’s wisdom, PAF connects spirituality with animal welfare & fosters compassion & sustainability.",
      image:
        "https://cimg.acharyaprashant.org/images/img-4296540b-edd0-44a6-bdad-8e649b640fd1/30/image.jpg",
      source: "Inshorts",
      date: "December 31, 2024",
    },
    {
      id: 2,
      title:
        "Redefining Education: How PAF's Free Books Distribution Drives Are Shaping the Next Generation",
      description:
        "The Free Press Journal covered PrashantAdvait Foundation’s initiative to distribute free books in schools and colleges across India, redefining education by blending spirituality with scientific inquiry.",
      image:
        "https://cimg.acharyaprashant.org/images/img-4ed0f623-ad93-471d-aa89-c576f7774b6e/30/image.jpg",
      source: "The Free Press Journal",
      date: "December 30, 2024",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 1;

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );

  const nextPage = () => {
    if (currentPage < Math.ceil(articles.length / articlesPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-16 lg:px-24">
      <h1 className="text-4xl font-bold text-center mb-8">
        Media and Public Interaction
      </h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
        Here is the comprehensive list of articles published by prestigious top
        media houses and renowned national dailies, based on Acharya Prashant’s
        teachings.
      </p>

      {/* Article Cards */}
      <div className="h-auto w-full flex flex-col items-center">
        {currentArticles.map((article) => (
          <div
            key={article.id}
            className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-3/4 mb-8"
          >
            <img
              src={article.image}
              alt={article.title}
              className="w-full md:w-1/3 object-cover"
            />

            {/* Content Section */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {article.title}
                </h2>
                <p className="text-gray-600 mt-2">{article.description}</p>
              </div>
              <div className="mt-4 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-start md:items-center">
                <span>
                  {article.source} - {article.date}
                </span>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-full transition-colors hover:border-[#DC2626] hover:text-[#DC2626] group mt-4 md:mt-0">
                  Full Coverage
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 mt-8">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <p>
          Showing {indexOfFirstArticle + 1} to{" "}
          {Math.min(indexOfLastArticle, articles.length)} of {articles.length}{" "}
          results
        </p>
        <button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(articles.length / articlesPerPage)
          }
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default InMedia;
