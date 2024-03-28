import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
import { ImageUsers, User, imageUpload } from "../model/model";
export const router = express.Router();

router.get("/", (req, res) => {
  conn.query("SELECT i.userID, i.imageID, i.url, u.username, i.count FROM images i JOIN users u ON i.userID = u.userID", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

let selectedImages :Image[] = [];
let time: number ;

router.get("/random/:id", (req, res) => {
  let userID = req.params.id;
  if (!userID) {
      res.status(400).json({ error: "Missing user_id parameter" });
      return;
  }

  if (selectedImages.length === 0) {

      // If no images are selected yet, perform the random selection query
      const sql = "SELECT i.userID, i.imageID, i.url, u.username, i.count FROM images i JOIN users u ON i.userID = u.userID ORDER BY RAND() LIMIT 2";
      const sqlTime = "SELECT time FROM time";
      conn.query(sqlTime, (err, timeResult) => {
          if (err) {
              console.error("Error executing time query:", err);
              res.status(500).json({ error: "Internal server error" });
              return;
          }
          const timeInMilliseconds = timeResult[0].time * 1000;
         
          time = timeInMilliseconds;
      });
      conn.query(sql, (err, result) => {
          if (err) {
              console.error("Error executing query:", err);
              res.status(500).json({ error: "Internal server error" });
              return;
          }

          result.forEach((img: { imageID: any }) => {
              // Check if the image is already selected
              const isAlreadySelected = selectedImages.some(item => item.imageID === img.imageID && item.userID === userID);
              if (!isAlreadySelected) {
                  selectedImages.push({ imageID: img.imageID, userID: userID });
                 
                  // Start the countdown of 10 seconds and remove the imageID from selectedImages
                  setTimeout(() => {
                      const index = selectedImages.findIndex(
                          (item) =>
                              item.imageID === img.imageID && item.userID === userID
                      );
                      if (index !== -1) {
                          selectedImages.splice(index, 1);
                          console.log(
                              `Removed imageID ${img.imageID} from selectedImages for user ${userID}`
                          );
                      }
                  }, time); // 10 seconds
              }
          });
          res.json(result);
          console.log(selectedImages)
      });
  } else {
    const selectedPictureIDs = selectedImages.filter(item => item.userID === userID).map(item => item.imageID);
        let sql;
 

        if(selectedPictureIDs.length > 0){
          console.error("more");
          sql = "SELECT i.userID, i.imageID, i.url, u.username, i.count FROM images i JOIN users u ON i.userID = u.userID WHERE i.imageID NOT IN (?)  ORDER BY RAND() LIMIT 2";
  
        } else {
          sql = "SELECT i.userID, i.imageID, i.url, u.username, i.count FROM images i JOIN users u ON i.userID = u.userID ORDER BY RAND() LIMIT 2";
        }
        console.log("selectedPictureIDs Userid  " + userID + " = " + selectedPictureIDs);
        conn.query(sql, [selectedPictureIDs.map((item) => item)], (err, result) => {
          
            if (err) {
                console.error("Error executing query:", err);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
         
            result.forEach((pic: { imageID: any }) => {
                selectedImages.push({
                    imageID: pic.imageID,
                    userID: userID,
                });
                // Start a timer to remove imageID from selectedImages after a certain time
                setTimeout(() => {
                    const index = selectedImages.findIndex(
                        (item) =>
                            item.imageID === pic.imageID && item.userID === userID
                    );
                    if (index !== -1) {
                        selectedImages.splice(index, 1);
                        console.log(
                            `Removed imageID ${pic.imageID} from selectedImages for user ${userID}`
                        );
                    }
                },  time); // Time in seconds
            });
            // Send the query results back
            res.json(result);
            console.log(selectedImages)
        });
  }

  
});





router.get("/count", (req, res) => {
  let sql = 'SELECT userID, COUNT(*) AS image_count FROM images GROUP BY userID';
  conn.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(404).json({ message: "image not found" });
    }
  });
});

router.get("/:id", (req, res) => {
  let id = req.params.id;
  let sql = 'SELECT * FROM images where imageID = ?';
  sql = mysql.format(sql, [id]);

  conn.query(sql, (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      let imageObject = result[0];
      res.status(201).json(imageObject);
    } else {
      res.status(404).json({ message: "image not found" });
    }
  });
});



router.delete("/:id", (req, res) => {
  let id = req.params.id;

  let voteSql = 'DELETE FROM votes WHERE imageID = ?';
  voteSql = mysql.format(voteSql, [id]);

  conn.query(voteSql, (err, voteResult) => {
    if (err) throw err;

    let statsSql = 'DELETE FROM statistics WHERE imageID = ?';
    statsSql = mysql.format(statsSql, [id]);

    conn.query(statsSql, (err, statsResult) => {
      if (err) throw err;

      let imageSql = 'DELETE FROM images WHERE imageID = ?';
      imageSql = mysql.format(imageSql, [id]);

      conn.query(imageSql, (err, imageResult) => {
        if (err) throw err;

        res.json({ message: "Image " + id + " has been deleted" });
      });
    });
  });
});

router.delete("/", (req, res) => {
  let body = req.body;

  for(let i=0; i<body.id.length; i++){
    let voteSql = 'DELETE FROM votes WHERE imageID = ?';
    let statsSql = 'DELETE FROM statistics WHERE imageID = ?';
    let imageSql = 'DELETE FROM images WHERE imageID = ?';

    // Format SQL queries with the current ID
    voteSql = mysql.format(voteSql, [body.id[i]]);
    statsSql = mysql.format(statsSql, [body.id[i]]);
    imageSql = mysql.format(imageSql, [body.id[i]]);

    // Delete from votes table
    conn.query(voteSql, (err, voteResult) => {
      if (err) throw err;
    });

    // Delete from statistics table
    conn.query(statsSql, (err, statsResult) => {
      if (err) throw err;
    });

    // Delete from images table
    conn.query(imageSql, (err, imageResult) => {
      if (err) throw err;
    });
  }

  res.json({ message: "Images have been deleted" });
});

router.put("/:id", async (req, res) => {
  const id = + req.params.id;
  console.log(id);
  let update: imageUpload = req.body; // รับข้อมูลที่ต้องการอัปเดตจาก req.body
  console.log(req.body);
  let updateOriginal: imageUpload | undefined;

  let sql = mysql.format("select * from images where imageID = ?", [id]);

  let result = await queryAsync(sql);
  const rawData = JSON.parse(JSON.stringify(result));
  console.log(rawData);
  updateOriginal = rawData[0] as imageUpload;
  console.log(updateOriginal);

  let updateImage = { ...updateOriginal, ...update };
  console.log(update);
  console.log(updateImage);
  sql =
    "update  `images` set `url`=?, `uploadDate`=?, `count`=?, `userID`=? where `imageID`=?";
  sql = mysql.format(sql, [
    updateImage.url,
    updateImage.uploadDate,
    updateImage.count,
    updateImage.userID,
    id
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(201).json({ affected_row: result.affectedRows });
  });
});

interface Image {
  userID: string;
  imageID: string;
}