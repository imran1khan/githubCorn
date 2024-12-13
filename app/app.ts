import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const names = [
    "pixelhearts",
    "morgggan",
    "skinandbeautybymp",
    "katquattro",
    "kateheartsbeauty",
    "skin_that_rox",
    "melanin.organics",
    "_justemela_",
    "r0saliee",
    "wisterialaner",
    "leilonimua",
  ];
  let saved = false;

  for (const name of names) {
    if (saved) break; // Stop the loop if a user has been saved

    // Check if user already exists
    const user = await prisma.user.findFirst({
      where: {
        username : name, // Replace with appropriate logic for uniqueness
      },
    });

    if (user) {
      console.log("User already exists.");
      continue; // Skip to the next iteration
    }

    try {
      // Fetch Instagram data for the current user
      const instagramData = await fetch(
        `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${name}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key":
              "359e9857bemshcf756dd909cb502p1ac7d8jsned603b20a826",
            "x-rapidapi-host": "instagram-scraper-api2.p.rapidapi.com",
          },
        }
      );

      if (!instagramData.ok) {
        throw new Error(`Failed to fetch data for ${name}`);
      }

      const dataResp = await instagramData.json();

      // Save user to the database
      await prisma.user.create({
        data: {
          email: dataResp.data.public_email, // Replace with actual email field from `dataResp`
          name: dataResp.data.full_name,
          profileImage: dataResp.data.profile_pic_url_hd,
          username: name
        },
      });

      console.log(`User "${name}" has been saved.`);
      saved = true; // Set flag to true after saving the user
    } catch (error) {
      console.error(`Error saving user "${name}":`, error);
    }
  }
}

// Run the main function
main()
  .catch((e: unknown) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
