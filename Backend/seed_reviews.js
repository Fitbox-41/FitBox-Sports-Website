import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String, required: true },
  images: [{ type: String }],
  helpful: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  reviews: [reviewSchema]
});

const Product = mongoose.model('Product', productSchema);

const seed = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas.");

    const product = await Product.findOne({ id: 1 });
    if (!product) {
      console.log("Product with ID 1 not found!");
      process.exit(1);
    }

    const reviews = [];
    const names = [
      "Aarav Mehta", "Sanya Goel", "Rohan Das", "Ananya Iyer", "Karan Malhotra",
      "Meera Sen", "Kabir Kapoor", "Nisha Joshi", "Aditya Roy", "Diya Sharma",
      "Vikram Nair", "Isha Patel", "Arjun Varma", "Riya Singhal", "Siddharth Rao",
      "Pooja Hegde", "Varun Dhawan", "Kriti Sanon", "Ranbir Kapoor", "Alia Bhatt",
      "Neha Kakkar", "Arijit Singh", "Shreya Ghoshal", "Diljit Dosanjh", "Guru Randhawa"
    ];

    const comments = [
      "Amazing quality! The dumbbells feel very sturdy and the grip is exceptionally comfortable.",
      "Decent for home workouts. The plastic shells feel slightly cheap but they do the job well.",
      "Superb value for money! I highly recommend these for anyone starting their fitness journey.",
      "Sturdy during exercise, is user friendly and offers great value. Satisfied with this purchase.",
      "The materials used are top grade. Highly durable and well balanced.",
      "Good performance. Although the color is slightly different from the image, they work great.",
      "Best purchase of the month. Very robust and easy to clean.",
      "Excellent grip, very user friendly. Highly recommend!",
      "Perfect for daily bodyweight exercises. Happy with the quick delivery.",
      "Very sturdy, doesn't wobble. Highly recommended for daily training."
    ];

    const titles = [
      "Value for Money", "Highly Recommended", "Sturdy & Reliable", "Great Home Gym Gear",
      "Excellent Quality", "Extremely Satisfied", "Top Grade Materials", "Good balance and grip"
    ];

    const dims = [
      [300, 300], [400, 300], [300, 400], [600, 300], [300, 600], 
      [500, 350], [350, 500], [450, 450], [640, 480], [480, 640]
    ];

    const generateImageUrl = (idx) => {
      const [w, h] = dims[idx % dims.length];
      return `https://picsum.photos/id/${10 + (idx % 80)}/${w}/${h}`;
    };

    for (let i = 0; i < 25; i++) {
      const reviewImages = [];
      reviewImages.push(generateImageUrl(i * 2));
      reviewImages.push(generateImageUrl(i * 2 + 1));

      reviews.push({
        userId: new mongoose.Types.ObjectId(),
        userName: names[i % names.length],
        rating: Math.floor(Math.random() * 3) + 3,
        title: titles[i % titles.length],
        comment: comments[i % comments.length],
        images: reviewImages,
        helpful: [],
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      });
    }

    product.reviews = reviews;
    await product.save();
    console.log("Successfully seeded 25 reviews and 50 custom aspect-ratio images to product ID 1!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
