import React from "react";
import { Grid, Box, Button, Typography, List, ListItem } from "@mui/material";

const faqs = [
  {
    question: "What is ThriveWell?",
    description:
      "ThriveWell is an app designed to help social workers and caregivers build safe, stable family environments where children can thrive.",
    answer: [
      "For those working with children in the foster or orphanage systems, it will promote stable temporary placement and a path to permanency within a family.",
      "For those working with children and families at risk of separation, it will provide a holistic and data driven approach to family strengthening.",
    ],
  },
  {
    question: "Why is FosterShare/Thrive Scale becoming ThriveWell?",
    description:
      "ThriveWell is combining the best of FosterShare and Thrive Scale into one platform to allow child welfare organization to:",
    answer: [
      "Facilitate the collection and delivery of real-time, relevant, and complete information between key stakeholders about the child and family’s well being",
      "Bubble up important patterns so action can be taken without delay",
      "Provide resources for all beneficiaries to improve their situation",
    ],
  },
  {
    question: "When is FosterShare/Thrive Scale’s blackout period?",
    description:
      "Thrive Scale will be unavailable starting at 11AM Central Time on July 13th. FosterShare will be unavailable starting at 9PM Central Time on July 13th.",
    answer: [
      "This blackout period ensures that all your data transfers over to ThriveWell so you can start using ThriveWell on July 15th with out any interruption to your normal work flow.",
    ],
  },
  {
    question: "When can I start using ThriveWell?",
    description:
      "You will be able to log in to the ThriveWell app or Web at 8AM Central Time on July 15th.",
    answer: [],
  },
  {
    question: "What does this mean for me?",
    description:
      "All of your information, including your login credentials, and all of your previously submitted data will be available in ThriveWell. Starting on July 15th at 8 AM CT, you will use ThriveWell for your logging and assessments.",
    answer: [],
  },
  // Add more FAQs here
];

const App = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F2EEE5", // Light sandal color for the whole page background
        backgroundImage: "url(/static/faqs/background.jpg)",
        backgroundSize: "contain", // Adjust the size of the background image
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          position: "relative",
          flexDirection: "column",
          paddingBottom: "20px",
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "15px",
          }}
        >
          <Grid item xs={12} md={7} sx={{ textAlign: "center" }}>
            <img
              src="/static/faqs/phone.png"
              alt="ThriveWell App"
              style={{ width: "60%", margin: "0 auto" }}
            />
          </Grid>

          <Grid item xs={12} md={5} sx={{ textAlign: "center" }}>
            <img
              src="/static/faqs/logo.png"
              alt="ThriveWell Logo"
              style={{ width: "35%" }}
            />
            <Typography
              variant="body1"
              sx={{ fontSize: "1.2em", margin: "1em 0" }}
            >
              The app that helps children thrive in families.
            </Typography>
            <Button
              href="mailto:support@thrivewellapp.com"
              sx={{
                backgroundColor: "#f37127",
                color: "black",
                border: "2px solid #f37127",
                padding: "0.7em 1.5em",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "20px",
                transition: "background-color 0.5s, color 0.5s, border 0.5s",
                "&:hover": {
                  backgroundColor: "#ffffff",
                  color: "black",
                  border: "2px solid #f37127",
                },
              }}
            >
              ASK US ABOUT THRIVEWELL
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F2EEE5",
          backgroundImage: "url(/static/faqs/right-image.png)",
          backgroundSize: "30%", // Adjust the size of the background image
          backgroundPositionX: "right",
          backgroundPositionY: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          flexDirection: "column",
          paddingBottom: "20px",
          paddingTop: "20px",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h2" sx={{ fontSize: "2em", marginBottom: "20px" }}>
          FAQs
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            pr: "10%",
          }}
        >
          <img
            src="/static/faqs/left-image.png"
            alt="Left Decoration"
            style={{ width: "10%", height: "10%" }}
          />
          <List sx={{ textAlign: "left", width: "65%", mr: "10%" }}>
            {faqs.map((faq, index) => (
              <ListItem
                key={index}
                sx={{ display: "block", marginBottom: "20px" }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontSize: "1.2em", fontWeight: "bold" }}
                >
                  {faq.question}
                </Typography>
                <Box sx={{ paddingLeft: "20px" }}>
                  <Typography variant="body1" sx={{ fontSize: "1em" }}>
                    {faq.description}
                  </Typography>
                  <List sx={{ listStyleType: "disc", paddingLeft: "20px" }}>
                    {faq.answer.map((answer, i) => (
                      <ListItem key={i} sx={{ display: "list-item" }}>
                        <Typography variant="body1" sx={{ fontSize: "1em" }}>
                          {answer}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </ListItem>
            ))}
          </List>
          {/* <img src="/static/faqs/right-image.png" alt="Right Decoration" style={{ width: '40%' }} /> */}
        </Box>
      </Box>
    </Box>
  );
};

export default App;
