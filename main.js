console.log("Starting Twitter Image Auto Post...");

//Modules
require("dotenv").config();
const Twitter = require("twitter");
const schedule = require("node-schedule");
const fs = require("fs");
const path = require("path");


//Connect to Twitter
const client = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

//Get the first PNG file in a directory
function getFirstPNGFileInDirectory(directory) {
	const files = fs.readdirSync(directory);
	files.sort();

	for (let fileIndex in files) {
		const file = files[fileIndex];

		if (path.extname(file) === ".png") {
			return file;
		}
	}
}

schedule.scheduleJob(process.env.TWITTER_SCHEDULE, () => {
	const inputDirectory = __dirname + "\\input\\";
	const imageFileName = getFirstPNGFileInDirectory(inputDirectory);
	const imageFilePath = inputDirectory + imageFileName;
	const imageData = fs.readFileSync(imageFilePath);

	client.post(
		"media/upload",
		{
			media: imageData
		},
		(error, media) => {
			if (error) {
				throw error;
			}

			client.post(
				"statuses/update",
				{
					status: process.env.TWITTER_STATUS,
					media_ids: media.media_id_string
				},
				(error2) => {
					if (error2) {
						throw error2;
					}

					fs.unlinkSync(imageFilePath);

					console.log(`Successfully tweeted ${imageFileName} with status "${process.env.TWITTER_STATUS}"`);
				}
			);
		}
	);
});

console.log(`Started schedule with cron "${process.env.TWITTER_SCHEDULE}" to tweet image`);
