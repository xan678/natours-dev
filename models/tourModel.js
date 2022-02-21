const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour must have length less or equal than 40 characters',
      ],
      minlength: [
        10,
        'A tour must have length more or equal than 10 characters',
      ],
      //validate: [validator.isAlpha, 'Name can only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'A tour must have a price'],
    },
    pricediscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to the current document on New document creation
          return val < this.price;
        },
        message: 'Price discount cannot be more than the price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Document Middleware
// Below Middleware runs before .save() command and .create() command, not on update command
// Logs the currently processed document
// tourSchema.pre('save', function (next) {
//   console.log(this);
// });

//pre document Middleware to slugify
//not using
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', (next) => {
  console.log('Will save document....');
  next();
});

tourSchema.post('save', (doc, next) => {
  console.log(doc);
  next();
});

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });
//This works for find as well as findOne, using Regex
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  //console.log(doc);
  next();
});

//Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  //console.log(this.pipeline());
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

//Virtual properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Model for our collection 'Tour'
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
