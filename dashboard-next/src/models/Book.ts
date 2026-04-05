import mongoose, { Schema, Document, Model } from 'mongoose';

// Define Stock interface
export interface IStock extends Document {
  soldOut: number;
  stockIn: number;
  available: number;
  lastUpdated: Date;
}

// Define TypeScript interface for the Book model
export interface IBook extends Document {
  title: string;
  author: string;
  publishedDate: Date;
  genre: string;
  language: string;
  ISBN: string;
  description: string;
  coverImage?: string; // Optional field for cover image
  pages: number;
  stock: IStock;
  price: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create Stock schema
const stockSchema: Schema = new Schema(
  {
    soldOut: {
      type: Number,
      default: 0,
      min: [0, 'Sold out count cannot be negative'],
    },
    stockIn: {
      type: Number,
      required: [true, 'Initial stock is required'],
      min: [0, 'Stock in count cannot be negative'],
    },
    available: {
      type: Number,
      min: [0, 'Available stock cannot be negative'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
); // Disable _id for subdocument

// Add middleware to calculate available stock
// stockSchema.pre('save', function(next) {
//   this.available = this.stockIn - this.soldOut;
//   this.lastUpdated = new Date();
//   next();
// });

const bookSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true, // Trim any spaces around the title
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true, // Trim spaces
      minlength: [3, 'Author name must be at least 3 characters long'],
    },
    publishedDate: {
      type: Date,
      required: [true, 'Published date is required'],
      validate: {
        validator: function (value: Date) {
          return value instanceof Date && !isNaN(value.getTime()); // Validating date format
        },
        message: 'Invalid published date',
      },
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    ISBN: {
      type: String,
      unique: true,
      required: [true, 'ISBN is required'],
      trim: true,
      validate: {
        validator: function (value: string) {
          // Basic validation for ISBN format (e.g., length 13 for ISBN-13)
          return /^[0-9]{13}$/.test(value);
        },
        message: 'Invalid ISBN format',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    coverImage: {
      type: String,
      required: false, // This field is optional as not all books might have a cover image
    },
    pages: {
      type: Number,
      required: [true, 'Pages are required'],
      min: [1, 'The number of pages must be greater than 0'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: stockSchema,
      required: [true, 'Stock information is required'],
      validate: {
        validator: function (value: IStock) {
          return value.available >= 0;
        },
        message: 'Available stock cannot be negative',
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    strict: true, // Ensures that only the fields defined in the schema are stored
    versionKey: false, // Disable the version key (__v)
  }
);

// Add an index to `ISBN` to optimize queries
bookSchema.index({ ISBN: 1, 'stock.available': 1 });

// Add pre-save hook to ensure `updatedAt` is updated correctly
bookSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add method to update stock
// bookSchema.methods.updateStock = async function(sold: number, added: number = 0) {
//   this.stock.soldOut += sold;
//   this.stock.stockIn += added;
//   await this.save();
//   return this;
// };

// Create the model
const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>('Book', bookSchema);

export default Book;
