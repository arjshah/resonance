import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.review.deleteMany({})
  await prisma.business.deleteMany({})
  await prisma.user.deleteMany({})
  
  console.log('Cleared existing data')

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })

  console.log('Created test user')

  // Create a business
  const business = await prisma.business.create({
    data: {
      name: "Good Earth Natural Foods",
      description: "Natural and organic food store",
      website: "http://genatural.com/",
      phone: "(415) 383-0123",
      address: "201 Flamingo Rd, Mill Valley, CA 94941",
      city: "Mill Valley",
      state: "CA",
      zipCode: "94941",
      country: "USA",
      industry: "Retail",
      ownerId: user.id,
    },
  })

  console.log('Created business')

  // Create sample reviews
  const reviews = await prisma.review.createMany({
    data: [
      {
        source: "google",
        rating: 5,
        text: "Outstanding service! The staff was incredibly helpful and professional. The attention to detail really impressed me.",
        authorName: "Sarah Johnson",
        isVerified: true,
        reviewDate: new Date("2024-03-15"),
        sentiment: "positive",
        keywords: ["service", "staff", "professional"],
        topics: ["customer service", "staff behavior"],
        businessId: business.id
      },
      {
        source: "yelp",
        rating: 4,
        text: "Good experience overall. Product quality is excellent but delivery took a bit longer than expected.",
        authorName: "Michael Chen",
        isVerified: true,
        reviewDate: new Date("2024-03-14"),
        sentiment: "neutral",
        keywords: ["delivery", "product quality"],
        topics: ["delivery", "product"],
        businessId: business.id
      },
      {
        source: "direct",
        rating: 5,
        text: "Absolutely love this place! The attention to detail is remarkable.",
        authorName: "Emily Rodriguez",
        isVerified: true,
        reviewDate: new Date("2024-03-13"),
        sentiment: "positive",
        keywords: ["love", "detail"],
        topics: ["general satisfaction"],
        businessId: business.id
      },
      {
        source: "google",
        rating: 3,
        text: "Decent service but room for improvement. Wait times could be shorter.",
        authorName: "David Wilson",
        isVerified: true,
        reviewDate: new Date("2024-03-12"),
        sentiment: "neutral",
        keywords: ["wait times", "service"],
        topics: ["wait time", "service quality"],
        businessId: business.id
      },
      {
        source: "yelp",
        rating: 5,
        text: "Exceeded my expectations in every way! The team went above and beyond.",
        authorName: "Lisa Thompson",
        isVerified: true,
        reviewDate: new Date("2024-03-11"),
        sentiment: "positive",
        keywords: ["expectations", "team"],
        topics: ["service quality"],
        businessId: business.id
      },
      {
        source: "google",
        rating: 4,
        text: "Really impressed with the innovative solutions they provided. The team's technical expertise is evident, though pricing is a bit on the higher side.",
        authorName: "James Mitchell",
        isVerified: true,
        reviewDate: new Date("2024-03-10"),
        sentiment: "positive",
        keywords: ["innovative", "technical", "pricing"],
        topics: ["expertise", "pricing"],
        businessId: business.id
      },
      {
        source: "yelp",
        rating: 2,
        text: "Had some issues with the response time. While the final result was okay, communication could have been much better throughout the process.",
        authorName: "Anna Kim",
        isVerified: true,
        reviewDate: new Date("2024-03-09"),
        sentiment: "negative",
        keywords: ["response time", "communication"],
        topics: ["communication", "service speed"],
        businessId: business.id
      }
    ]
  })

  console.log(`Created ${reviews.count} reviews`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 