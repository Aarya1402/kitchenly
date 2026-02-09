import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

export async function GET(req: Request) {
  // try {
  //   const { searchParams } = new URL(req.url);
  //
  //   const q = searchParams.get("q")?.trim() || "";
  //
  //   // ✅ support: cuisine=Indian,Italian
  //   // ✅ support: cuisine=Indian&cuisine=Italian
  //   const cuisineParams = searchParams.getAll("cuisine");
  //   const cuisines =
  //     cuisineParams.length > 1
  //       ? cuisineParams
  //       : cuisineParams
  //           .flatMap((c) => c.split(","))
  //           .map((c) => c.trim())
  //           .filter(Boolean);
  //
  //   const page = Number(searchParams.get("page") || 1);
  //   const limit = Number(searchParams.get("limit") || 10);
  //   const skip = (page - 1) * limit;
  //
  //   /* ───────── build where clause ───────── */
  //
  //   const where: Prisma.RecipeWhereInput = {};
  //
  //   // 🔍 search (optional)
  //   if (q) {
  //     where.OR = [
  //       {
  //         title: {
  //           contains: q,
  //           mode: Prisma.QueryMode.insensitive,
  //         },
  //       },
  //       {
  //         description: {
  //           contains: q,
  //           mode: Prisma.QueryMode.insensitive,
  //         },
  //       },
  //     ];
  //   }
  //
  //   // 🎛️ cuisine filter (multi-value)
  //   if (cuisines.length > 0) {
  //     where.cuisine = {
  //       in: cuisines,
  //     };
  //   }
  //
  //   /* ───────── queries ───────── */
  //
  //   const [recipes, total] = await Promise.all([
  //     prisma.recipe.findMany({
  //       where,
  //       orderBy: { createdAt: "desc" },
  //       skip,
  //       take: limit,
  //       include: {
  //         ingredients: true,
  //         steps: { orderBy: { stepNo: "asc" } },
  //       },
  //     }),
  //     prisma.recipe.count({ where }),
  //   ]);
  //
  //   return NextResponse.json({
  //     data: recipes,
  //     page,
  //     hasMore: skip + recipes.length < total,
  //   });
  // } catch (error) {
  //   console.error("Search error:", error);
  //   return NextResponse.json(
  //     { error: "Failed to fetch recipes" },
  //     { status: 500 },
  //   );
  // }

  return (`
  {
    "data": [
    {
      "id": "cmlaqetss000mfr4szbb0tdeg",
      "userId": "user_38eBWe8DUQki8Rx4nnlvA7Dgqc4",
      "title": "Aloo Paratha",
      "description": "Aloo (potato) stuffed parathas are unleavened dough stuffed with a spiced mixture of mashed potato, rolled out and cooked on a hot tava with ghee or butter. This recipe provides instructions for making them at home, pan-fried for an equally satisfying taste.",
      "imageUrl": "https://res.cloudinary.com/dyrjy91ai/image/upload/v1770373061/recipes/wlwtchxow2bm1pfo4yty.png",
      "servings": 4,
      "dietaryTags": [
        "vegetarian",
        "eggless"
      ],
      "cuisine": "Indian",
      "createdAt": "2026-02-06T10:17:42.735Z",
      "updatedAt": "2026-02-06T10:17:42.735Z",
      "ingredients": [
        {
          "name": "ghee or butter for frying the paratha",
          "quantity": ""
        },
        {
          "name": "yoghurt (dahi) to serve",
          "quantity": ""
        },
        {
          "name": "dough:",
          "quantity": ""
        },
        {
          "name": "1 kg wheat flour (coarse)",
          "quantity": ""
        },
        {
          "name": "water (3-4 small cups)",
          "quantity": ""
        },
        {
          "name": "for the mashed potato mix:",
          "quantity": ""
        },
        {
          "name": "1 kg potatoe (boiled and mashed)",
          "quantity": ""
        },
        {
          "name": "2 tsp cumin and coriander powder mix",
          "quantity": ""
        },
        {
          "name": "1/2 tsp red chilli powder or 1-2 green chilli",
          "quantity": ""
        },
        {
          "name": "salt to taste",
          "quantity": ""
        },
        {
          "name": "2 tsp garlic and ginger paste (freshly crushed with a mortar and pestle)",
          "quantity": ""
        },
        {
          "name": "2 medium sized red onion ( ) or 5 spring onion",
          "quantity": ""
        },
        {
          "name": "coriander leave",
          "quantity": ""
        },
        {
          "name": "1 tbsp sunflower oil",
          "quantity": ""
        },
        {
          "name": "for the tomato sauce (achar):",
          "quantity": ""
        },
        {
          "name": "3 tbsp sunflower oil",
          "quantity": ""
        },
        {
          "name": "1/2 tsp fenugreek",
          "quantity": ""
        },
        {
          "name": "2 tsp garlic and ginger ()",
          "quantity": ""
        },
        {
          "name": "3 green chilly (or 2 red chillies)",
          "quantity": ""
        },
        {
          "name": "1/2 kg tomatoe ()",
          "quantity": ""
        },
        {
          "name": "1/2 tsp turmeric powder",
          "quantity": ""
        },
        {
          "name": "1 tsp cumin & coriander powder mix",
          "quantity": ""
        },
        {
          "name": "salt to taste",
          "quantity": ""
        },
        {
          "name": "coriander leave",
          "quantity": ""
        },
        {
          "name": "for the mint sauce (achar):",
          "quantity": ""
        },
        {
          "name": "mint leave",
          "quantity": ""
        },
        {
          "name": "tomato sauce (achar)",
          "quantity": ""
        }
      ],
      "steps": [
        {
          "stepNo": 1,
          "content": "How to cook tomato sauce (achar) – step by step:"
        },
        {
          "stepNo": 2,
          "content": "Heat the frying pan and add the sunflower oil."
        },
        {
          "stepNo": 3,
          "content": "Add fenugreek and fry until the seeds turn black."
        },
        {
          "stepNo": 4,
          "content": "Add chopped ginger and garlic (and chillies for spicy sauce) and fry until golden brown."
        },
        {
          "stepNo": 5,
          "content": "Add chopped tomatoes."
        },
        {
          "stepNo": 6,
          "content": "Add all dried spices and salt to taste."
        },
        {
          "stepNo": 7,
          "content": "Cook for about 15-20 minutes. Add fresh coriander leaves."
        },
        {
          "stepNo": 8,
          "content": "Mix in a blender when cooled down."
        },
        {
          "stepNo": 9,
          "content": "To make the mint sauce simply mix some of the tomato sauce with fresh mint leaves in a blender."
        },
        {
          "stepNo": 10,
          "content": "How to cook aloo paratha – step by step:"
        },
        {
          "stepNo": 11,
          "content": "Knead the dough in a bowl with sufficient amount of water for 10-15 minutes and then cover with a cotton towel. Keep it aside for 20-30 minutes."
        },
        {
          "stepNo": 12,
          "content": "Boil and mash the potatoes. Add all dried spices, salt, freshly crushed garlic and ginger paste, finely chopped onions and fresh coriander leaves to the mash. Add oil to prevent the mash from sticking to your hands."
        },
        {
          "stepNo": 13,
          "content": "Sprinkle some flour on your kitchen board. Make balls of the kneaded dough."
        },
        {
          "stepNo": 14,
          "content": "Roll one ball at a time into a thick, flat, small circle."
        },
        {
          "stepNo": 15,
          "content": "Now lift the circle in your hand, and place potato mash (approximately 1 big tbsp) in the centre."
        },
        {
          "stepNo": 16,
          "content": "Keep the filling in the centre and fold the edges, ensuring the filling stays inside. Gently press the ball between your palms."
        },
        {
          "stepNo": 17,
          "content": "Place the ball on the kitchen board with enough flour to prevent from sticking. Gently roll it into 3mm thick flat circle by turning it around, ensuring that the stuffing is spread evenly all through. Keep in mind that the stuffing should not come out."
        },
        {
          "stepNo": 18,
          "content": "Heat the frying pan to medium temperature. Grease it with ghee or butter, then fry the paratha, by flipping it over, to make it evenly golden brown on both sides."
        },
        {
          "stepNo": 19,
          "content": "Your paratha is ready to eat. Serve it with tomato sauce, mint sauce and yoghurt."
        }
      ]
    },
    {
      "id": "cmlampsm40003fr4seyfpaxh5",
      "userId": "user_38eBWe8DUQki8Rx4nnlvA7Dgqc4",
      "title": "Old-Fashioned Onion Rings",
      "description": "Onion rings are a popular appetizer at many restaurants, and with this recipe, you can satisfy your craving at home. This is an actual recipe from a former employee of a popular drive-in restaurant. Sweet and tender on the inside, crispy and crunchy on the outside — just like the pros make!",
      "imageUrl": "https://res.cloudinary.com/dyrjy91ai/image/upload/v1770366854/recipes/sd2qp8dx8jbewtdlqhho.jpg",
      "servings": 3,
      "dietaryTags": [],
      "cuisine": "American",
      "createdAt": "2026-02-06T08:34:15.963Z",
      "updatedAt": "2026-02-06T08:34:15.963Z",
      "ingredients": [
        {
          "name": "vidalia or other sweet onion",
          "quantity": "1 large"
        },
        {
          "name": "oil for frying",
          "quantity": "1 quart"
        },
        {
          "name": "all-purpose flour",
          "quantity": "1 0.25 cup"
        },
        {
          "name": "baking powder",
          "quantity": "1 tsp"
        },
        {
          "name": "salt",
          "quantity": "1 tsp"
        },
        {
          "name": "milk",
          "quantity": "1 cup"
        },
        {
          "name": "egg",
          "quantity": "1 large"
        },
        {
          "name": "dry bread crumb",
          "quantity": "0.75 cup"
        },
        {
          "name": "seasoned salt",
          "quantity": "1/8 tsp"
        }
      ],
      "steps": [
        {
          "stepNo": 1,
          "content": "Gather all ingredients."
        },
        {
          "stepNo": 2,
          "content": "Slice onion into 1/4-inch-thick rings. Heat oil in a deep-fryer to 365 degrees F (185 degrees C). Place a wire rack over a sheet of aluminum foil."
        },
        {
          "stepNo": 3,
          "content": "Prepare breading station by setting out 3 wide, shallow dishes. Whisk flour, baking powder, and salt together in the first dish. Whisk milk and egg together in the second dish. Place bread crumbs in the third dish."
        },
        {
          "stepNo": 4,
          "content": "Dip each onion ring into the flour mixture, turning several times until fully coated with flour."
        },
        {
          "stepNo": 5,
          "content": "Transfer to the egg mixture and use a fork to turn until coated. Lift onion with the fork and shake gently so excess liquid drips back into the dish."
        },
        {
          "stepNo": 6,
          "content": "Place onion in the bread crumbs and turn several times to coat, scooping crumbs over the ring if necessary."
        },
        {
          "stepNo": 7,
          "content": "Lift again with the fork, tap any excess bread crumbs back into the dish, and place on the wire rack while you prepare the remaining onion rings."
        },
        {
          "stepNo": 8,
          "content": "Deep-fry 3 to 4 onion rings at a time in the preheated oil until golden brown, 2 to 3 minutes. Drain on paper towels while you deep-fry the remaining rings."
        },
        {
          "stepNo": 9,
          "content": "Sprinkle with seasoning salt before serving."
        }
      ]
    },
    {
      "id": "cmlajk10p0000frffjrkmpcp7",
      "userId": "user_38eBWe8DUQki8Rx4nnlvA7Dgqc4",
      "title": "CHOCOLATE CHIP COOKIES",
      "description": "A little bit crisp, a little bit chewy, and packed with chocolate chips, just the way I like 'em!",
      "imageUrl": "https://res.cloudinary.com/dyrjy91ai/image/upload/v1770361546/recipes/f259u0swczppq7go9pxq.png",
      "servings": 8,
      "dietaryTags": [
        "vegetarian",
        "vegan",
        "eggetarian"
      ],
      "cuisine": "",
      "createdAt": "2026-02-06T07:05:48.073Z",
      "updatedAt": "2026-02-06T07:31:35.197Z",
      "ingredients": [
        {
          "name": "100g butter, softened",
          "quantity": ""
        },
        {
          "name": "120g castor sugar",
          "quantity": ""
        },
        {
          "name": "1 large egg",
          "quantity": ""
        },
        {
          "name": "1/4 tsp vanilla extract",
          "quantity": ""
        },
        {
          "name": "150g plain flour",
          "quantity": ""
        },
        {
          "name": "1/2 tsp baking powder",
          "quantity": ""
        },
        {
          "name": "100g dark chocolate chip",
          "quantity": ""
        }
      ],
      "steps": [
        {
          "stepNo": 1,
          "content": "Preheat your oven to 180'c/ 350'F and line a baking tray with baking paper."
        },
        {
          "stepNo": 2,
          "content": "Cream the butter and castor sugar together until soft and fluffy."
        },
        {
          "stepNo": 3,
          "content": "Add the egg and vanilla extract and mix in."
        },
        {
          "stepNo": 4,
          "content": "Add the flour and baking powder and mix to combine."
        },
        {
          "stepNo": 5,
          "content": "Lastly, mix in the chocolate chips."
        },
        {
          "stepNo": 6,
          "content": "Wet your hands slightly and roll tablespoonfuls of dough into balls."
        },
        {
          "stepNo": 7,
          "content": "Arrange on the tray allowing room for spreading."
        },
        {
          "stepNo": 8,
          "content": "Flatten each ball slightly with a fork dipped in flour."
        },
        {
          "stepNo": 9,
          "content": "Bake for 10 minutes, then rotate the tray 180 degrees and bake for a further 4 minutes or until the cookies are golden at the edges."
        },
        {
          "stepNo": 10,
          "content": "Carefully transfer the cookies to a cooling rack."
        },
        {
          "stepNo": 11,
          "content": "Allow to cool before serving."
        }
      ]
    },
    {
      "id": "cml9egswv000cfryuun3gljx3",
      "userId": "user_38eBWe8DUQki8Rx4nnlvA7Dgqc4",
      "title": "Mediterranean Salmon",
      "description": "This easy Mediterranean salmon recipe is the perfect one-pan dinner for any night of the week! Feel free to swap out the veggies with whatever is in season. Just be sure to give sturdier vegetables (like potatoes) an extra 10-20 minutes in the oven and throw quick-cooking vegetables (like zucchini) in at the same time as the salmon.",
      "imageUrl": "https://res.cloudinary.com/dyrjy91ai/image/upload/v1770292532/recipes/ucjry2du91iowpkoe1jf.jpg",
      "servings": 4,
      "dietaryTags": [
        "non-vegetarian"
      ],
      "cuisine": "Mediterranean",
      "createdAt": "2026-02-05T11:55:33.332Z",
      "updatedAt": "2026-02-05T11:55:33.332Z",
      "ingredients": [
        {
          "name": "dried oregano",
          "quantity": "2 tsp"
        },
        {
          "name": "sumac",
          "quantity": "1 tsp"
        },
        {
          "name": "cumin",
          "quantity": "1 tsp"
        },
        {
          "name": "cherry tomatoe",
          "quantity": "1 cup"
        },
        {
          "name": "bell pepper",
          "quantity": "1"
        },
        {
          "name": "baby bella mushroom",
          "quantity": "5 oz"
        },
        {
          "name": "garlic clove",
          "quantity": "4 to 5 large"
        },
        {
          "name": "feta cheese block",
          "quantity": "5 to 6 oz"
        },
        {
          "name": "kosher salt",
          "quantity": "to taste"
        },
        {
          "name": "black pepper",
          "quantity": "to taste"
        },
        {
          "name": "thyme",
          "quantity": "6 to 7 sprigs"
        },
        {
          "name": "extra virgin olive oil",
          "quantity": "as needed"
        },
        {
          "name": "salmon fillet",
          "quantity": "4 (6-oz) portions"
        },
        {
          "name": "",
          "quantity": ""
        }
      ],
      "steps": [
        {
          "stepNo": 1,
          "content": "Get ready. Preheat your oven to 425°F. In a small bowl, combine the oregano, sumac, and cumin."
        },
        {
          "stepNo": 2,
          "content": "Season the vegetables. Add the tomatoes, mushrooms, bell peppers, and 4 to 5 peeled garlic cloves to a large baking dish or sheet tray. Sprinkle with 1/2 tablespoon of the spice mixture (save the rest for the fish) and a good pinch of salt and pepper. Drizzle with 1 to 2 tablespoon olive oil, toss to coat, and spread so that everything is in one layer."
        },
        {
          "stepNo": 3,
          "content": "Bake the vegetables and feta. Nestle chunks of feta in between the vegetables and top with a few sprigs of fresh thyme. Place in the heated oven and bake until the vegetables have begun to soften, about 10 minutes."
        },
        {
          "stepNo": 4,
          "content": "Season the fish. Meanwhile, pat the fish dry and season on both sides with salt, pepper, and the remaining spice mixture."
        },
        {
          "stepNo": 5,
          "content": "Bake the salmon. Carefully remove the sheet pan from the oven and nestle the salmon in with the veggies and feta. Top the salmon with a drizzle of olive oil, then cover the pan with aluminum foil to trap the steam. Return to the center rack of the heated oven until the fish is cooked through and flakes easily, about 10 minutes."
        },
        {
          "stepNo": 6,
          "content": "Finish and serve. Remove the salmon from the oven, carefully remove the foil, and immediately squeeze lemon juice onto the fish. Serve with lemon wedges on the side for squeezing."
        }
      ]
    },
    {
      "id": "cml7kuw1h000pfrjpalqhxyy7",
      "userId": "user_38eBWe8DUQki8Rx4nnlvA7Dgqc4",
      "title": "Vada Pav Recipe",
      "description": "Learn how to make Mumbai's beloved street food Vada Pav at home!",
      "imageUrl": "https://res.cloudinary.com/dyrjy91ai/image/upload/v1770182334/recipes/x1mo0yeestkl8t1zgmml.jpg",
      "servings": 6,
      "dietaryTags": [
        "vegetarian"
      ],
      "cuisine": "Indian",
      "createdAt": "2026-02-04T05:18:55.925Z",
      "updatedAt": "2026-02-04T05:20:17.253Z",
      "ingredients": [
        {
          "name": "russet potatoe",
          "quantity": "2 large"
        },
        {
          "name": "coriander seed",
          "quantity": "2 tsp"
        },
        {
          "name": "cumin seed",
          "quantity": "0.5 tsp"
        },
        {
          "name": "oil",
          "quantity": "2 tbsp"
        },
        {
          "name": "mustard seed",
          "quantity": "0.5 tsp"
        },
        {
          "name": "asafetida",
          "quantity": "0.125 tsp"
        },
        {
          "name": "turmeric",
          "quantity": "0.5 tsp"
        },
        {
          "name": "ginger",
          "quantity": "1 tbsp"
        },
        {
          "name": "green chili",
          "quantity": "1 tbsp"
        },
        {
          "name": "curry leave",
          "quantity": "12"
        },
        {
          "name": "kosher salt",
          "quantity": "2 tsp"
        },
        {
          "name": "sugar",
          "quantity": "0.5 tsp"
        },
        {
          "name": "lemon juice",
          "quantity": "0.5 tbsp"
        },
        {
          "name": "cilantro",
          "quantity": "2 tbsp"
        },
        {
          "name": "besan",
          "quantity": "1 cup"
        },
        {
          "name": "ajwain seed",
          "quantity": "0.5 tsp"
        },
        {
          "name": "kosher salt",
          "quantity": "1 tsp"
        },
        {
          "name": "turmeric",
          "quantity": "0.25 tsp"
        },
        {
          "name": "water",
          "quantity": "0.5 cup"
        },
        {
          "name": "baking soda",
          "quantity": "0.125 tsp"
        },
        {
          "name": "shredded coconut",
          "quantity": "0.5 cup"
        },
        {
          "name": "garlic clove",
          "quantity": "5"
        },
        {
          "name": "kosher salt",
          "quantity": "0.5 tsp"
        },
        {
          "name": "kashmiri red chili powder",
          "quantity": "1 tsp"
        },
        {
          "name": "fried besan piece",
          "quantity": "0.25 cup"
        },
        {
          "name": "cilantro",
          "quantity": "1 cup"
        },
        {
          "name": "green chily",
          "quantity": "1 to 2"
        },
        {
          "name": "garlic clove",
          "quantity": "1"
        },
        {
          "name": "cumin seed",
          "quantity": "0.5 tsp"
        },
        {
          "name": "roasted chana dal",
          "quantity": "1 tbsp"
        },
        {
          "name": "kosher salt",
          "quantity": "1 tsp"
        },
        {
          "name": "sugar",
          "quantity": "1 tsp"
        },
        {
          "name": "lemon juice",
          "quantity": "0.5 tbsp"
        },
        {
          "name": "water",
          "quantity": "0.5 cup"
        },
        {
          "name": "pav",
          "quantity": "12"
        },
        {
          "name": "tamarind chutney",
          "quantity": "0.5 cup"
        },
        {
          "name": "green chily",
          "quantity": "12"
        },
        {
          "name": "kosher salt",
          "quantity": "0.25 tsp"
        }
      ],
      "steps": [
        {
          "stepNo": 1,
          "content": "Add 1 cup of water to the Instant Pot insert. Place the trivet inside and arrange the potatoes on top of the trivet. Close the Instant Pot lid and set the pressure release valve to sealing. Pressure cook for 15 minutes, then allow for natural pressure release. Note: You can also steam potatoes on the stovetop. Allow the potatoes to cool, then peel off the skin and cut them into small cubes. Roughly crush the coriander and cumin seeds in a mortar and pestle, and set aside. Heat oil in a medium skillet. Add mustard seeds and let them splutter. Add asafetida, turmeric, crushed cumin and coriander seeds, ginger, green chili, and curry leaves, and cook for one minute. Add the potatoes and salt, mixing thoroughly and roughly mashing them with the back of a spatula or a masher to create a smooth filling. Stir in the sugar and lemon juice, then garnish with cilantro. Mix well and let it cool. Shape the mixture into round balls and flatten them to make vadas about 2 inches wide and ½ inch thick. You should be able to make 10 to 12 vadas"
        },
        {
          "stepNo": 2,
          "content": "Add besan to a mixing bowl. Lightly crush the ajwain seeds by rubbing them between your palms to release their aroma, then add them to the bowl along with turmeric and salt. Gradually add water, mixing well to create a smooth, flowing batter. Add baking soda just before you are ready to fry, and give it a quick stir."
        },
        {
          "stepNo": 3,
          "content": "Heat oil in a frying pan or kadai. To check the oil temperature, drop a few drops of batter into the oil; they should rise quickly within 10 seconds. Dip your fingers into the batter, then gently shake your hand over the oil to form small, roundish balls (known as Chura) in the oil. Ensure your fingertips are at least 6 inches above the oil to avoid the hot oil from splattering on your hands. Fry on medium heat for 3 to 4 minutes or until they turn lightly golden and crispy. Remove the Chura with a slotted spatula and drain on a paper towel-lined dish. Repeat the process until you have about 1 cup of fried Chura. Allow it to cool. Add whole green chilies to the hot oil and fry for 3 to 4 minutes. Remove them with a slotted spatula and drain on paper towels. Sprinkle salt over the fried chilies. These chilies are optional but for a full Mumbai street-style taste you must try it at least once. Dip the shaped vada one at a time into the batter. Use a spoon to generously coat it on all sides, lift and tilt the spoon to remove any excess batter, to create a thin layer of coating around the vada. Carefully add the vada to the hot oil using the spoon. Repeat with another 2 or 3 vadas. Fry until golden brown on both sides, about 3 to 4 minutes, turning halfway through. Fry the remaining vadas in batches."
        },
        {
          "stepNo": 4,
          "content": "Add garlic, fried chura, coconut, salt, and Kashmiri red chili powder to the grinder jar. Grind until all the ingredients are well incorporated, forming a slightly coarse chutney."
        },
        {
          "stepNo": 5,
          "content": "Add cilantro, green chili, garlic, cumin seeds, roasted chana dal (or fried chura), salt, sugar, lemon juice, and water to a blender jar and blend until smooth."
        },
        {
          "stepNo": 6,
          "content": "Slice the pav in the center without cutting it all the way through. Spread green chutney on one side and tamarind chutney on the other. Place a vada on the green chutney side, then sprinkle garlic chutney and chura on top of the vada. Add a green chili on top, then gently press the pav closed.Assemble the remaining vadas just before serving."
        }
      ]
    },
    {
      "id": "cml0o6hyk008ifryeefpzc7cz",
      "userId": "user_38eBWe8DUQki8Rx4nnlvA7Dgqc4",
      "title": "Roasted Brussels Sprouts Recipe",
      "description": "Roasted Brussels Sprouts are an oven-roasted vegetable dish made with fresh sprouts, olive oil, dried herbs, salt, and pepper. The sprouts are cut evenly and roasted at high heat until tender and browned. This cooking method improves flavor and texture. It works as a simple side dish for Indian and Western meals.",
      "imageUrl": "https://res.cloudinary.com/dyrjy91ai/image/upload/v1769764652/recipes/mxsi83gperf7r0ebdf7d.jpg",
      "servings": 2,
      "dietaryTags": [
        "vegetarian",
        "gluten-free"
      ],
      "cuisine": "Western",
      "createdAt": "2026-01-30T09:17:33.165Z",
      "updatedAt": "2026-01-30T09:18:13.353Z",
      "ingredients": [
        {
          "name": "brussel sprout",
          "quantity": "300 g"
        },
        {
          "name": "extra virgin olive oil",
          "quantity": "2 tbsp"
        },
        {
          "name": "dried sage",
          "quantity": "0.5 tsp"
        },
        {
          "name": "dried rosemary",
          "quantity": "0.5 tsp"
        },
        {
          "name": "dried basil",
          "quantity": "0.25 tsp"
        },
        {
          "name": "dried thyme",
          "quantity": "0.25 tsp"
        },
        {
          "name": "crushed black pepper",
          "quantity": "1/8 to 0.25 tsp"
        },
        {
          "name": "fine sea salt",
          "quantity": "0.25 tsp"
        }
      ],
      "steps": [
        {
          "stepNo": 1,
          "content": "Preheat the oven to 200°C (390°F) for about 20 minutes so it is fully hot before roasting. Rinse the Brussels sprouts well under running water and pat them completely dry with a kitchen towel. Moisture on the surface can prevent proper browning. If using very fresh or organic sprouts, soak them in salted water for 10 to 15 minutes, then rinse and dry thoroughly. Trim off and discard the hard stalk end from each sprout. Halve medium-sized sprouts and quarter larger ones so they are similar in size. Smaller sprouts can be left whole. Transfer the prepared sprouts to an oven-safe roasting pan or baking tray. Add olive oil, dried herbs, salt, and black pepper. Mix and toss well so that the sprouts are evenly coated with the olive oil, herbs and seasonings."
        },
        {
          "stepNo": 2,
          "content": "Spread the sprouts in a single layer on the tray without overcrowding. Keep a bit of space between the sprouts. Place the tray in the preheated oven and roast at 200°C (390°F) for 30 to 35 minutes or until the sprouts are browned at the edges and tender from inside. Halfway through roasting, after 15 to 20 minutes, carefully remove the tray using oven mittens and turn the sprouts using a spatula. Return the tray to the oven and continue roasting for 15 minutes or until the Brussels Sprouts are tender and browned at the edges. Remove from the oven and serve hot or warm."
        },
        {
          "stepNo": 3,
          "content": "Serve the Roasted Brussels Sprouts as a simple side with rice dishes, pasta, soup, salad, grilled tofu or veggies, or roasted potatoes. They can be enjoyed hot or warm. Store leftovers in an airtight container in the refrigerator for up to one day. Reheat in a pan or oven until warm before serving."
        }
      ]
    },
    {
      "id": "cml0o541j007tfrye504v608k",
      "userId": "user_38eBWe8DUQki8Rx4nnlvA7Dgqc4",
      "title": "Pani Puri",
      "description": "Pani puri is a popular Indian street food of crispy, fried, hollow dough balls that are stuffed with boiled potatoes, steamed moong sprouts, spicy tangy water and sweet chutney.",
      "imageUrl": "https://res.cloudinary.com/dyrjy91ai/image/upload/v1769764588/recipes/sgpytw34oyaioweqxpyk.jpg",
      "servings": 4,
      "dietaryTags": [
        "vegetarian"
      ],
      "cuisine": "Indian",
      "createdAt": "2026-01-30T09:16:28.471Z",
      "updatedAt": "2026-02-04T04:32:16.749Z",
      "ingredients": [
        {
          "name": "potatoe",
          "quantity": "2-3"
        },
        {
          "name": "onion",
          "quantity": "1"
        },
        {
          "name": "coriander leave",
          "quantity": "1-1.5 tbsp"
        },
        {
          "name": "roasted cumin powder",
          "quantity": "1 tsp"
        },
        {
          "name": "chaat masala powder",
          "quantity": "1 tsp"
        },
        {
          "name": "red chili powder",
          "quantity": "0.25 tsp"
        },
        {
          "name": "black salt",
          "quantity": "to taste"
        },
        {
          "name": "mint leave",
          "quantity": "0.5 cup"
        },
        {
          "name": "coriander leave",
          "quantity": "1 cup"
        },
        {
          "name": "ginger,",
          "quantity": "1 inch"
        },
        {
          "name": "green chilies,",
          "quantity": "2-3"
        },
        {
          "name": "tamarind",
          "quantity": "1 tbsp"
        },
        {
          "name": "jaggery powder",
          "quantity": "3.5-4 tbsp"
        },
        {
          "name": "roasted cumin powder",
          "quantity": "1 tsp"
        },
        {
          "name": "chaat masala powder",
          "quantity": "1 tsp"
        },
        {
          "name": "water",
          "quantity": "0.33 cup"
        },
        {
          "name": "water",
          "quantity": "1-1.25 cup"
        },
        {
          "name": "boondi",
          "quantity": "1-1.5 tbsp"
        },
        {
          "name": "black salt",
          "quantity": "to taste"
        },
        {
          "name": "puri",
          "quantity": "24-30"
        },
        {
          "name": "tamarind chutney",
          "quantity": "1 small bowl"
        },
        {
          "name": "myingredient",
          "quantity": "299 g"
        }
      ],
      "steps": [
        {
          "stepNo": 1,
          "content": "Boil the potatoes till they are cooked completely. Peel them and then chop them. Finely chop the onion if using it. In a small bowl, mix the potatoes, onions, coriander leaves, cumin powder, chaat masala powder and black salt or regular salt. Mix well and keep aside."
        },
        {
          "stepNo": 2,
          "content": "In a blender add all the ingredients mentioned above for the pani. Add water and grind to a fine chutney. Remove the green chutney in a large bowl. Rinse the mixer jar with 1/2 cup water first and then add this water in the bowl. Then add 1/2 to 3/4 cup more water. Mix well. Check the seasoning. Add more salt or jeera powder or chaat masala or jaggery if required. If you want a thin pani, you could add some water. But keep on checking the seasoning, as per your taste. Add the boondi to the pani. You can chill the pani in the fridge or add some ice cubes to it."
        },
        {
          "stepNo": 3,
          "content": "Crack the top of the puri with a spoon. Add 2 to 3 teaspoons of the boiled potato-onion filling in the poori. Stir the green pani first and then add it in the poori. Optionally you can add some sweet chutney in the puri. Serve the pani puri immediately otherwise the prepared puri with stuffing and water will become soggy. You can also make individual portions with the puris, potato-onion mixture and the pani. Let the individual assemble the pani puri for himself/herself as per his/her taste."
        }
      ]
    },
    {
      "id": "cml0hwil2002wfr4qlyire14t",
      "userId": "user_38eBWe8DUQki8Rx4nnlvA7Dgqc4",
      "title": "Chole Recipe (Punjabi Chole Masala)",
      "description": "Chole masala is a spicy & flavorful North Indian dish made with chole aka chickpeas, spices and herbs. Serve Punjabi chole with Bhatura, Basmati rice, poori or naan. Instructions for Stovetop and Instant pot included.",
      "imageUrl": "https://res.cloudinary.com/dyrjy91ai/image/upload/v1769754108/recipes/it0iw757vjr0lvsidauh.jpg",
      "servings": 4,
      "dietaryTags": [
        "Vegetarian",
        "Gluten-Free",
        "Nut-Free"
      ],
      "cuisine": "Indian",
      "createdAt": "2026-01-30T06:21:49.707Z",
      "updatedAt": "2026-01-30T06:21:49.707Z",
      "ingredients": [
        {
          "name": "chickpea",
          "quantity": "1 cup"
        },
        {
          "name": "water",
          "quantity": "2 cup"
        },
        {
          "name": "black tea bag",
          "quantity": "1"
        },
        {
          "name": "small bay leaf",
          "quantity": "1"
        },
        {
          "name": "black cardamom",
          "quantity": "1"
        },
        {
          "name": "green cardamom",
          "quantity": "4"
        },
        {
          "name": "cinnamon",
          "quantity": "1 inch"
        },
        {
          "name": "clove",
          "quantity": "2"
        },
        {
          "name": "cinnamon",
          "quantity": "1 inch"
        },
        {
          "name": "clove",
          "quantity": "2"
        },
        {
          "name": "small bay leaf",
          "quantity": "1"
        },
        {
          "name": "green cardamon",
          "quantity": "2"
        },
        {
          "name": "oil",
          "quantity": "2 tbsp"
        },
        {
          "name": "onion",
          "quantity": "1 0.5 cup"
        },
        {
          "name": "green chili",
          "quantity": "1"
        },
        {
          "name": "ginger garlic",
          "quantity": "0.75 to 1 tbsp"
        },
        {
          "name": "tomatoe",
          "quantity": "1 cup"
        },
        {
          "name": "salt",
          "quantity": "0.75 to 1 tsp"
        },
        {
          "name": "kashmiri red chili powder",
          "quantity": "0.5 to 0.75 tsp"
        },
        {
          "name": "chole masala",
          "quantity": "1 tbsp"
        },
        {
          "name": "garam masala",
          "quantity": "0.75 tsp"
        },
        {
          "name": "coriander powder",
          "quantity": "1 tsp"
        },
        {
          "name": "turmeric",
          "quantity": "1/8 tsp"
        },
        {
          "name": "amchur",
          "quantity": "0.25 to 0.5 tsp"
        },
        {
          "name": "kasuri methi",
          "quantity": "1 tsp"
        },
        {
          "name": "ghee",
          "quantity": "1 tbsp"
        },
        {
          "name": "ginger",
          "quantity": "0.5 inch"
        },
        {
          "name": "green chilli",
          "quantity": "2 to 4"
        },
        {
          "name": "hing",
          "quantity": "0.25 tsp"
        },
        {
          "name": "coriander leave",
          "quantity": "2 tbsp"
        }
      ],
      "steps": [
        {
          "stepNo": 1,
          "content": "Add chickpeas to a pot and rinse them well, at least thrice. Pour 3 to 4 cups fresh water and soak overnight, for a minimum of 8 hours. Next morning, drain the water and rinse them well. Add to a pressure cooker along with water, bay leaf, cinnamon, cloves, cardamom, black cardamom and tea bag or dried amla or tea decoction (process mentioned in the post). Pressure cook until soft for 5 to 6 whistles on a medium heat. If cooking in an Instant Pot, pressure cook for 16 minutes. When the pressure drops, open the lid and discard the cinnamon, bay leaf & tea bag. Chickpeas should be soft cooked and not al dente. If they are undercooked cook, longer."
        },
        {
          "stepNo": 2,
          "content": "Heat oil in a pan, add the optional whole spices - cinnamon, cloves, green cardamoms and bay leaf. When they begin to sizzle, add onions and green chili. Fry them until golden on a medium heat. Stir in the ginger garlic paste and saute for a minute, until it loses the raw flavor. Next add tomatoes and cook on a medium high heat until they lose the moisture and raw flavor. Reduce the heat, stir in the red chili powder, turmeric and salt. If using store bought chole masala, add chole masala powder, garam masala powder and coriander powder. If using homemade spice blend mentioned in the notes below, add the prepared powder (you won't add the coriander powder or garam masala). Saute for 3 to 4 minutes until the masala smells good. Add the pressure cooked chole along with chickpeas cooked water and 1 cup more water. Mix together and add more water if needed to bring it to a gravy consistency. Bring it to a rolling boil on a high heat. Cover and simmer on a low flame for about 18 to 20 minutes until the chole absorb the flavors of masala & the gravy becomes thick. Mix well and taste test. Add kasuri methi, more salt, amchur or garam masala if required."
        },
        {
          "stepNo": 3,
          "content": "Heat ghee in a small tadka pan. Fry slit green chilies until blistered (use a splatter screen), and add ginger juliennes. Turn off and add hing. Pour this hing tadka over the Chole. Sprinkle coriander leaves. Serve chole with basmati rice, naan, poori or bhatura."
        },
        {
          "stepNo": 4,
          "content": "Press saute button on the IP and pour oil. When the IP displays hot, add the spices. Then the onions and green chili. Saute the onions until golden to light brown. Then add in ginger garlic and saute for 30 seconds. Next add the tomatoes and salt. Saute well until they break down a bit. Stir in red chili powder and turmeric. If using readymade chole masala, add chole masala powder, garam masala powder and coriander powder. If using homemade powder mentioned in the post, add the prepared powder (you won't add the coriander powder or garam masala). Saute well until the raw smell of the onion and tomatoes reduces. Pour 2 cups water and deglaze the pot. Then add soaked chickpeas. If you want you may add a tea bag or 1 cup decoction in place of 1 cup water. Mix well and secure the IP with the lid. Position the steam release handle to sealing. Press cancel. Then press pressure cook (high pressure) and set the timer for 35 mins. If using canned chickpeas, then set the timer to 10 mins. When the IP is done cooking wait for 18 to 20 mins for the pressure to release naturally. Then open the lid. Add ghee, ginger julienne and kasuri methi. (Or make a tadka before serving). Taste test and add more salt, amchur or garam masala if required. Press saute button and cook for a few minutes. To thicken the curry you can take 3 to 4 tbsps chole to a bowl and mash them well. Add to the gravy. Garnish with coriander leaves."
        }
      ]
    }
  ],
      "page": 1,
      "limit": 8,
      "total": 21,
      "totalPages": 3,
      "hasMore": true
  }
`)
}
