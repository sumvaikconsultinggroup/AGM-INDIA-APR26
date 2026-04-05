import React from "react";

const UpdateForm = () => {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4">GET UPDATES</h3>
      <p className="text-gray-300 mb-4">
        Receive handpicked articles, quotes and videos of Acharya Swami Avdheshanand Giri ji
        regularly.
      </p>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Your email address"
          className="w-full px-4 py-2 rounded-md bg-white"
        />
        <div className="text-center text-gray-300">OR</div>
        <div className="flex gap-2">
          <select className="w-20 px-2 py-2 rounded-md bg-white">
            <option className=" text-black">+91</option>
          </select>
          <input
            type="tel"
            placeholder="WhatsApp number"
            className="flex-1 px-4 py-2 rounded-md bg-white"
          />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" className="rounded" />
            English
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" className="rounded" />
            Hindi
          </label>
        </div>
        <div className="flex justify-center">
          <button className="w-1/3 bg-white text-black py-2 rounded-md transition-colors">
            Subscribe
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateForm;
