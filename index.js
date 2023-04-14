// Cloud Function to get the average noise_level for each individual location_id
// for each Sunday

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Cloud Firestore reference
const firestore = admin.firestore();
exports.getSundayAverageNoiseLevel = functions.pubsub
    .schedule("0 1 * * 1").onRun(async (context) =>{
      try {
        // Retrieve all documents from the "RawSensorData" collection
        const querySnapshot = await firestore.collection("RawSensorData").get();
        const docs = querySnapshot.docs;
        // Calculate the weekly average noise for each individual location_id
        // and hour of the day on Sundays
        const averages = {};
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        for (const doc of docs) {
          const timestamp = doc.data().Timestamp.toDate();

          if (timestamp < threeMonthsAgo) {
            continue;
          }

          const locationId = doc.data().LocationID;
          const noiseLevels = doc.data().Decibels;
          const timestampAdjusted =
          new Date(timestamp.getTime() - 4 * 60 * 60 * 1000);
          const dayOfWeek = timestampAdjusted
              .toLocaleDateString("en-US", {weekday: "long"});
          const hour = timestampAdjusted.getHours();

          if (dayOfWeek !== "Sunday") {
            continue;
          }

          if (!averages[locationId]) {
            averages[locationId] = {};
          }

          if (!averages[locationId][hour]) {
            averages[locationId][hour] = {
              sum: 0,
              count: 0,
            };
          }

          const noiseLevelsSum = Array.isArray(noiseLevels) ? noiseLevels
              .reduce((acc, val) => acc + parseFloat(val), 0) :
                         parseFloat(noiseLevels);
          const noiseLevelsCount = Array.isArray(noiseLevels) ?
              noiseLevels.length : 1;

          averages[locationId][hour] = {
            sum: averages[locationId][hour].sum + noiseLevelsSum,
            count: averages[locationId][hour].count + noiseLevelsCount,
          };
        }

        // Calculate the final average for each individual location_id
        // and hour of the day on Sundays
        const finalAverages = {};
        for (const locationId of Object.keys(averages)) {
          finalAverages[locationId] = {};
          for (let i = 0; i < 24; i++) {
            const hourData = averages[locationId][i] ||
                {sum: 0, count: 0};
            const hourAverage = hourData.count > 0 ?
                 hourData.sum/hourData.count : 0;
            finalAverages[locationId][i] = hourAverage.toFixed(2);
            console.log(`Average  at hour ${i} on Sunday: ${hourAverage}`);
          }
        }

        // Update the collection with the final weekly average
        await Promise.all(
            Object.keys(finalAverages).map(async (locationId) => {
              const weeklyAverage = finalAverages[locationId];
              for (const hourI of Object.keys(weeklyAverage)) {
                const aggregatedSoundData = {
                  location_id: locationId,
                  day_of_week: "Sunday",
                  hourly_noise_level: weeklyAverage[hourI],
                  hour: hourI,
                };

                const aggregatedSoundDataRef = await firestore
                    .collection("AggregatedSoundData")
                    .where("location_id", "==", locationId)
                    .where("day_of_week", "==", "Sunday")
                    .where("hour", "==", hourI)
                    .get();
                if (aggregatedSoundDataRef.empty) {
                  const aggregatedSoundDataId =
                    `location_${locationId}_sunday_hour_${hourI}`;
                  await firestore.collection("AggregatedSoundData")
                      .doc(aggregatedSoundDataId).set(aggregatedSoundData);
                  console.log(`Added new average for ${locationId} on Sunday`);
                } else {
                  await firestore.collection("AggregatedSoundData")
                      .update(aggregatedSoundData);
                  console.log(`Updated average for ${locationId} on Sunday`);
                }
              }
            }));
      } catch (error) {
        console.error(error);
      }
    });
// Monday Average
exports.getMondayAverageNoiseLevel = functions.pubsub
    .schedule("0 1 * * 2").onRun(async (context) =>{
      try {
        // Retrieve all documents from the "RawSensorData" collection
        const querySnapshot = await firestore.collection("RawSensorData").get();
        const docs = querySnapshot.docs;
        // Calculate the weekly average noise for each individual location_id
        // and hour of the day on Mondays
        const averages = {};
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        for (const doc of docs) {
          const timestamp = doc.data().Timestamp.toDate();

          if (timestamp < threeMonthsAgo) {
            continue;
          }

          const locationId = doc.data().LocationID;
          const noiseLevels = doc.data().Decibels;
          const timestampAdjusted =
          new Date(timestamp.getTime() - 4 * 60 * 60 * 1000);
          const dayOfWeek = timestampAdjusted
              .toLocaleDateString("en-US", {weekday: "long"});
          const hour = timestampAdjusted.getHours();
          if (dayOfWeek !== "Monday") {
            continue;
          }
          if (!averages[locationId]) {
            averages[locationId] = {};
          }

          if (!averages[locationId][hour]) {
            averages[locationId][hour] = {
              sum: 0,
              count: 0,
            };
          }

          const noiseLevelsSum = Array.isArray(noiseLevels) ? noiseLevels
              .reduce((acc, val) => acc + parseFloat(val), 0) :
                        parseFloat(noiseLevels);
          const noiseLevelsCount = Array.isArray(noiseLevels) ?
              noiseLevels.length : 1;

          averages[locationId][hour] = {
            sum: averages[locationId][hour].sum + noiseLevelsSum,
            count: averages[locationId][hour].count + noiseLevelsCount,
          };
        }

        // Calculate the final average for each individual location_id
        // and hour of the day on Mondays
        const finalAverages = {};
        for (const locationId of Object.keys(averages)) {
          finalAverages[locationId] = {};
          for (let i = 0; i < 24; i++) {
            const hourData = averages[locationId][i] ||
                {sum: 0, count: 0};
            const hourAverage = hourData.count > 0 ?
                hourData.sum/hourData.count : 0;
            finalAverages[locationId][i] = hourAverage.toFixed(2);
            console.log(`Average  at hour ${i} on Monday: ${hourAverage}`);
          }
        }

        // Update the collection with the final weekly average
        await Promise.all(
            Object.keys(finalAverages).map(async (locationId) => {
              const weeklyAverage = finalAverages[locationId];
              for (const hourI of Object.keys(weeklyAverage)) {
                const aggregatedSoundData = {
                  location_id: locationId,
                  day_of_week: "Monday",
                  hourly_noise_level: weeklyAverage[hourI],
                  hour: hourI,
                };

                const aggregatedSoundDataRef = await firestore
                    .collection("AggregatedSoundData")
                    .where("location_id", "==", locationId)
                    .where("day_of_week", "==", "Monday")
                    .where("hour", "==", hourI)
                    .get();
                if (aggregatedSoundDataRef.empty) {
                  const aggregatedSoundDataId =
                    `location_${locationId}_Monday_hour_${hourI}`;
                  await firestore.collection("AggregatedSoundData")
                      .doc(aggregatedSoundDataId).set(aggregatedSoundData);
                  console.log(`Added new average for ${locationId} on Monday`);
                } else {
                  await firestore.collection("AggregatedSoundData")
                      .set(aggregatedSoundData);
                  console.log(`Updated average for ${locationId} on Monday`);
                }
              }
            }));
      } catch (error) {
        console.error(error);
      }
    });
// Tuesday Average calculated every wednesday 1:00 AM
exports.getTuesdayAverageNoiseLevel = functions.pubsub
    .schedule("0 1 * * 3").onRun(async (context) =>{
      try {
        // Retrieve all documents from the "RawSensorData" collection
        const querySnapshot = await firestore.collection("RawSensorData").get();
        const docs = querySnapshot.docs;
        // Calculate the weekly average noise for each individual location_id
        // and hour of the day on Tuesdays
        const averages = {};
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        for (const doc of docs) {
          const timestamp = doc.data().Timestamp.toDate();

          if (timestamp < threeMonthsAgo) {
            continue;
          }

          const locationId = doc.data().LocationID;
          const noiseLevels = doc.data().Decibels;
          const timestampAdjusted =
          new Date(timestamp.getTime() - 4 * 60 * 60 * 1000);
          const dayOfWeek = timestampAdjusted
              .toLocaleDateString("en-US", {weekday: "long"});
          const hour = timestampAdjusted.getHours();
          if (dayOfWeek !== "Tuesday") {
            continue;
          }

          if (!averages[locationId]) {
            averages[locationId] = {};
          }

          if (!averages[locationId][hour]) {
            averages[locationId][hour] = {
              sum: 0,
              count: 0,
            };
          }

          const noiseLevelsSum = Array.isArray(noiseLevels) ? noiseLevels
              .reduce((acc, val) => acc + parseFloat(val), 0) :
                         parseFloat(noiseLevels);
          const noiseLevelsCount = Array.isArray(noiseLevels) ?
              noiseLevels.length : 1;

          averages[locationId][hour] = {
            sum: averages[locationId][hour].sum + noiseLevelsSum,
            count: averages[locationId][hour].count + noiseLevelsCount,
          };
        }

        // Calculate the final average for each individual location_id
        // and hour of the day on Tuesdays
        const finalAverages = {};
        for (const locationId of Object.keys(averages)) {
          finalAverages[locationId] = {};
          for (let i = 0; i < 24; i++) {
            const hourData = averages[locationId][i] ||
                {sum: 0, count: 0};
            const hourAverage = hourData.count > 0 ?
                 hourData.sum/hourData.count : 0;
            finalAverages[locationId][i] = hourAverage.toFixed(2);
            console.log(`Average  at hour ${i} on Tuesday: ${hourAverage}`);
          }
        }

        // Update the collection with the final weekly average
        await Promise.all(
            Object.keys(finalAverages).map(async (locationId) => {
              const weeklyAverage = finalAverages[locationId];
              for (const hourI of Object.keys(weeklyAverage)) {
                const aggregatedSoundData = {
                  location_id: locationId,
                  day_of_week: "Tuesday",
                  hourly_noise_level: weeklyAverage[hourI],
                  hour: hourI,
                };

                const aggregatedSoundDataRef = await firestore
                    .collection("AggregatedSoundData")
                    .where("location_id", "==", locationId)
                    .where("day_of_week", "==", "Tuesday")
                    .where("hour", "==", hourI)
                    .get();
                if (aggregatedSoundDataRef.empty) {
                  const aggregatedSoundDataId =
                    `location_${locationId}_Tuesday_hour_${hourI}`;
                  await firestore.collection("AggregatedSoundData")
                      .doc(aggregatedSoundDataId).set(aggregatedSoundData);
                  console.log(`Added new average for ${locationId} on Tuesday`);
                } else {
                  await firestore.collection("AggregatedSoundData")
                      .set(aggregatedSoundData);
                  console.log(`Updated average for ${locationId} on Tuesday`);
                }
              }
            }));
      } catch (error) {
        console.error(error);
      }
    });
// Wednesday Average Calculated every thurday at 1 AM
exports.getWednesdayAverageNoiseLevel = functions.pubsub
    .schedule("0 1 * * 4").onRun(async (context) =>{
      try {
        // Retrieve all documents from the "RawSensorData" collection
        const querySnapshot = await firestore.collection("RawSensorData").get();
        const docs = querySnapshot.docs;
        // Calculate the weekly average noise for each individual location_id
        // and hour of the day on Wednesdays
        const averages = {};
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        for (const doc of docs) {
          const timestamp = doc.data().Timestamp.toDate();

          if (timestamp < threeMonthsAgo) {
            continue;
          }

          const locationId = doc.data().LocationID;
          const noiseLevels = doc.data().Decibels;
          const timestampAdjusted =
          new Date(timestamp.getTime() - 4 * 60 * 60 * 1000);
          const dayOfWeek = timestampAdjusted
              .toLocaleDateString("en-US", {weekday: "long"});
          const hour = timestampAdjusted.getHours();
          if (dayOfWeek !== "Wednesday") {
            continue;
          }

          if (!averages[locationId]) {
            averages[locationId] = {};
          }

          if (!averages[locationId][hour]) {
            averages[locationId][hour] = {
              sum: 0,
              count: 0,
            };
          }

          const noiseLevelsSum = Array.isArray(noiseLevels) ? noiseLevels
              .reduce((acc, val) => acc + parseFloat(val), 0) :
                         parseFloat(noiseLevels);
          const noiseLevelsCount = Array.isArray(noiseLevels) ?
              noiseLevels.length : 1;

          averages[locationId][hour] = {
            sum: averages[locationId][hour].sum + noiseLevelsSum,
            count: averages[locationId][hour].count + noiseLevelsCount,
          };
        }

        // Calculate the final average for each individual location_id
        // and hour of the day on Wednesdays
        const finalAverages = {};
        for (const locationId of Object.keys(averages)) {
          finalAverages[locationId] = {};
          for (let i = 0; i < 24; i++) {
            const hourData = averages[locationId][i] ||
                {sum: 0, count: 0};
            const hourAverage = hourData.count > 0 ?
                 hourData.sum/hourData.count : 0;
            finalAverages[locationId][i] = hourAverage.toFixed(2);
            console.log(`Average  at hour ${i} on Wednesday: ${hourAverage}`);
          }
        }

        // Update the collection with the final weekly average
        await Promise.all(
            Object.keys(finalAverages).map(async (locationId) => {
              const weeklyAverage = finalAverages[locationId];
              for (const hourI of Object.keys(weeklyAverage)) {
                const aggregatedSoundData = {
                  location_id: locationId,
                  day_of_week: "Wednesday",
                  hourly_noise_level: weeklyAverage[hourI],
                  hour: hourI,
                };

                const aggregatedSoundDataRef = await firestore
                    .collection("AggregatedSoundData")
                    .where("location_id", "==", locationId)
                    .where("day_of_week", "==", "Wednesday")
                    .where("hour", "==", hourI)
                    .get();
                if (aggregatedSoundDataRef.empty) {
                  const aggregatedSoundDataId =
                    `location_${locationId}_Wednesday_hour_${hourI}`;
                  await firestore.collection("AggregatedSoundData")
                      .doc(aggregatedSoundDataId).set(aggregatedSoundData);
                  console.log(`Added average for ${locationId} on Wednesday`);
                } else {
                  await firestore.collection("AggregatedSoundData")
                      .set(aggregatedSoundData);
                  console.log(`Updated average for ${locationId} on Wednesday`);
                }
              }
            }));
      } catch (error) {
        console.error(error);
      }
    });
// Thursday average calculated every friday 1 AM
// Cloud Function to get the average noise_level for each individual location_id
// for each Thursday
exports.getThursdayAverageNoiseLevel = functions.pubsub
    .schedule("0 1 * * 5").onRun(async (context) =>{
      try {
        // Retrieve all documents from the "RawSensorData" collection
        const querySnapshot = await firestore.collection("RawSensorData").get();
        const docs = querySnapshot.docs;
        // Calculate the weekly average noise for each individual location_id
        // and hour of the day on Thursdays
        const averages = {};
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        for (const doc of docs) {
          const timestamp = doc.data().Timestamp.toDate();

          if (timestamp < threeMonthsAgo) {
            continue;
          }

          const locationId = doc.data().LocationID;
          const noiseLevels = doc.data().Decibels;
          const timestampAdjusted =
          new Date(timestamp.getTime() - 4 * 60 * 60 * 1000);
          const dayOfWeek = timestampAdjusted
              .toLocaleDateString("en-US", {weekday: "long"});
          const hour = timestampAdjusted.getHours();

          if (dayOfWeek !== "Thursday") {
            continue;
          }

          if (!averages[locationId]) {
            averages[locationId] = {};
          }

          if (!averages[locationId][hour]) {
            averages[locationId][hour] = {
              sum: 0,
              count: 0,
            };
          }

          const noiseLevelsSum = Array.isArray(noiseLevels) ? noiseLevels
              .reduce((acc, val) => acc + parseFloat(val), 0) :
                         parseFloat(noiseLevels);
          const noiseLevelsCount = Array.isArray(noiseLevels) ?
              noiseLevels.length : 1;

          averages[locationId][hour] = {
            sum: averages[locationId][hour].sum + noiseLevelsSum,
            count: averages[locationId][hour].count + noiseLevelsCount,
          };
        }

        // Calculate the final average for each individual location_id
        // and hour of the day on Thursdays
        const finalAverages = {};
        for (const locationId of Object.keys(averages)) {
          finalAverages[locationId] = {};
          for (let i = 0; i < 24; i++) {
            const hourData = averages[locationId][i] ||
                {sum: 0, count: 0};
            const hourAverage = hourData.count > 0 ?
                 hourData.sum/hourData.count : 0;
            finalAverages[locationId][i] = hourAverage.toFixed(2);
            console.log(`Average  at hour ${i} on Thursday: ${hourAverage}`);
          }
        }

        // Update the collection with the final weekly average
        await Promise.all(
            Object.keys(finalAverages).map(async (locationId) => {
              const weeklyAverage = finalAverages[locationId];
              for (const hourI of Object.keys(weeklyAverage)) {
                const aggregatedSoundData = {
                  location_id: locationId,
                  day_of_week: "Thursday",
                  hourly_noise_level: weeklyAverage[hourI],
                  hour: hourI,
                };

                const aggregatedSoundDataRef = await firestore
                    .collection("AggregatedSoundData")
                    .where("location_id", "==", locationId)
                    .where("day_of_week", "==", "Thursday")
                    .where("hour", "==", hourI)
                    .get();
                if (aggregatedSoundDataRef.empty) {
                  const aggregatedSoundDataId =
                    `location_${locationId}_thursday_hour_${hourI}`;
                  await firestore.collection("AggregatedSoundData")
                      .doc(aggregatedSoundDataId).set(aggregatedSoundData);
                  console.log(`Added newaverage for ${locationId} on Thursday`);
                } else {
                  await firestore.collection("AggregatedSoundData")
                      .set(aggregatedSoundData);
                  console.log(`Updated average for ${locationId} on Thursday`);
                }
              }
            }));
      } catch (error) {
        console.error(error);
      }
    });
// Cloud Function to get the average noise_level for each individual location_id
// for each Friday

exports.getFridayAverageNoiseLevel = functions.pubsub
    .schedule("0 1 * * 6").onRun(async (context) =>{
      try {
        // Retrieve all documents from the "RawSensorData" collection
        const querySnapshot = await firestore.collection("RawSensorData").get();
        const docs = querySnapshot.docs;
        // Calculate the weekly average noise for each individual location_id
        // and hour of the day on Fridays
        const averages = {};
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        for (const doc of docs) {
          const timestamp = doc.data().Timestamp.toDate();

          if (timestamp < threeMonthsAgo) {
            continue;
          }

          const locationId = doc.data().LocationID;
          const noiseLevels = doc.data().Decibels;
          const timestampAdjusted =
          new Date(timestamp.getTime() - 4 * 60 * 60 * 1000);
          const dayOfWeek = timestampAdjusted
              .toLocaleDateString("en-US", {weekday: "long"});
          const hour = timestampAdjusted.getHours();

          if (dayOfWeek !== "Friday") {
            continue;
          }

          if (!averages[locationId]) {
            averages[locationId] = {};
          }

          if (!averages[locationId][hour]) {
            averages[locationId][hour] = {
              sum: 0,
              count: 0,
            };
          }

          const noiseLevelsSum = Array.isArray(noiseLevels) ? noiseLevels
              .reduce((acc, val) => acc + parseFloat(val), 0) :
                          parseFloat(noiseLevels);
          const noiseLevelsCount = Array.isArray(noiseLevels) ?
              noiseLevels.length : 1;

          averages[locationId][hour] = {
            sum: averages[locationId][hour].sum + noiseLevelsSum,
            count: averages[locationId][hour].count + noiseLevelsCount,
          };
        }

        // Calculate the final average for each individual location_id
        // and hour of the day on Fridays
        const finalAverages = {};
        for (const locationId of Object.keys(averages)) {
          finalAverages[locationId] = {};
          for (let i = 0; i < 24; i++) {
            const hourData = averages[locationId][i] ||
                {sum: 0, count: 0};
            const hourAverage = hourData.count > 0 ?
                  hourData.sum/hourData.count : 0;
            finalAverages[locationId][i] = hourAverage.toFixed(2);
            console.log(`Average  at hour ${i} on Friday: ${hourAverage}`);
          }
        }

        // Update the collection with the final weekly average
        await Promise.all(
            Object.keys(finalAverages).map(async (locationId) => {
              const weeklyAverage = finalAverages[locationId];
              for (const hourI of Object.keys(weeklyAverage)) {
                const aggregatedSoundData = {
                  location_id: locationId,
                  day_of_week: "Friday",
                  hourly_noise_level: weeklyAverage[hourI],
                  hour: hourI,
                };

                const aggregatedSoundDataRef = await firestore
                    .collection("AggregatedSoundData")
                    .where("location_id", "==", locationId)
                    .where("day_of_week", "==", "Friday")
                    .where("hour", "==", hourI)
                    .get();
                if (aggregatedSoundDataRef.empty) {
                  const aggregatedSoundDataId =
                    `location_${locationId}_friday_hour_${hourI}`;
                  await firestore.collection("AggregatedSoundData")
                      .doc(aggregatedSoundDataId).set(aggregatedSoundData);
                  console.log(`Added new average for ${locationId} on Friday`);
                } else {
                  await firestore.collection("AggregatedSoundData")
                      .set(aggregatedSoundData);
                  console.log(`Updated average for ${locationId} on Friday`);
                }
              }
            }));
      } catch (error) {
        console.error(error);
      }
    });
// Cloud Function to get the average noise_level for each individual location_id
// for each Saturday
exports.getSaturdayAverageNoiseLevel = functions.pubsub
    .schedule("0 1 * * 0").onRun(async (context) =>{
      try {
        // Retrieve all documents from the "RawSensorData" collection
        const querySnapshot = await firestore.collection("RawSensorData").get();
        const docs = querySnapshot.docs;
        // Calculate the weekly average noise for each individual location_id
        // and hour of the day on Saturdays
        const averages = {};
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        for (const doc of docs) {
          const timestamp = doc.data().Timestamp.toDate();

          if (timestamp < threeMonthsAgo) {
            continue;
          }

          const locationId = doc.data().LocationID;
          const noiseLevels = doc.data().Decibels;
          const timestampAdjusted =
          new Date(timestamp.getTime() - 4 * 60 * 60 * 1000);
          const dayOfWeek = timestampAdjusted
              .toLocaleDateString("en-US", {weekday: "long"});
          const hour = timestampAdjusted.getHours();

          if (dayOfWeek !== "Saturday") {
            continue;
          }

          if (!averages[locationId]) {
            averages[locationId] = {};
          }

          if (!averages[locationId][hour]) {
            averages[locationId][hour] = {
              sum: 0,
              count: 0,
            };
          }

          const noiseLevelsSum = Array.isArray(noiseLevels) ? noiseLevels
              .reduce((acc, val) => acc + parseFloat(val), 0) :
                         parseFloat(noiseLevels);
          const noiseLevelsCount = Array.isArray(noiseLevels) ?
              noiseLevels.length : 1;

          averages[locationId][hour] = {
            sum: averages[locationId][hour].sum + noiseLevelsSum,
            count: averages[locationId][hour].count + noiseLevelsCount,
          };
        }

        // Calculate the final average for each individual location_id
        // and hour of the day on Saturdays
        const finalAverages = {};
        for (const locationId of Object.keys(averages)) {
          finalAverages[locationId] = {};
          for (let i = 0; i < 24; i++) {
            const hourData = averages[locationId][i] ||
                {sum: 0, count: 0};
            const hourAverage = hourData.count > 0 ?
                 hourData.sum/hourData.count : 0;
            finalAverages[locationId][i] = hourAverage.toFixed(2);
            console.log(`Average  at hour ${i} on Saturday: ${hourAverage}`);
          }
        }

        // Update the collection with the final weekly average
        await Promise.all(
            Object.keys(finalAverages).map(async (locationId) => {
              const weeklyAverage = finalAverages[locationId];
              for (const hourI of Object.keys(weeklyAverage)) {
                const aggregatedSoundData = {
                  location_id: locationId,
                  day_of_week: "Saturday",
                  hourly_noise_level: weeklyAverage[hourI],
                  hour: hourI,
                };

                const aggregatedSoundDataRef = await firestore
                    .collection("AggregatedSoundData")
                    .where("location_id", "==", locationId)
                    .where("day_of_week", "==", "Saturday")
                    .where("hour", "==", hourI)
                    .get();
                if (aggregatedSoundDataRef.empty) {
                  const aggregatedSoundDataId =
                    `location_${locationId}saturday_hour${hourI}`;
                  await firestore.collection("AggregatedSoundData")
                      .doc(aggregatedSoundDataId).set(aggregatedSoundData);
                  console.log(`Added newaverage for ${locationId} on Saturday`);
                } else {
                  await firestore.collection("AggregatedSoundData")
                      .set(aggregatedSoundData);
                  console.log(`Updated average for ${locationId} on Saturday`);
                }
              }
            }));
      } catch (error) {
        console.error(error);
      }
    });
