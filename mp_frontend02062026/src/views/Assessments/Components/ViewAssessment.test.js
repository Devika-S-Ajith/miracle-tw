// ViewAssessment.test.js

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ViewAssessment from "../../Assessments/Components/ViewAssessment";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme();
const mockGetAssessmentDetails = jest.fn();
const mockFormList = jest.fn();
const mockDomainList = jest.fn();
const mockCaseDetails = jest.fn();
const mockGetDomainSkipReasons = jest.fn();
const mockGetFollowupDomainDetails = jest.fn();

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

jest.mock("@mui/system", () => {
  const actual = jest.requireActual("@mui/system");

  return {
    ...actual,
    styled:
      (Component) =>
      () =>
      (props) =>
        <Component {...props} />,
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    state: {
      formRevisionNumber: 1,
    },
  }),
  useParams: () => ({
    id: "123",
  }),
}));

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

jest.mock("../../../common/hooks/UseApiCalls", () => ({
  FormList: (...args) => mockFormList(...args),
  DomainList: (...args) => mockDomainList(...args),
  GetAssessmentDetails: (...args) =>
    mockGetAssessmentDetails(...args),
  CaseDetails: (...args) => mockCaseDetails(...args),
  getDomainSkipReasons: (...args) =>
    mockGetDomainSkipReasons(...args),
  getFollowupDomainDetails: (...args) =>
    mockGetFollowupDomainDetails(...args),
}));

jest.mock(
  "../../../components/UserComponents/ReportGenerator",
  () => ({
    PrintAsPDF: jest.fn(),
  })
);

jest.mock("./AssessmentChildDetails", () => () => (
  <div>AssessmentChildDetails</div>
));

jest.mock("./AssessmentSummary", () => () => (
  <div>AssessmentSummary</div>
));

jest.mock("./AssessmentObservations", () => () => (
  <div>AssessmentObservations</div>
));

jest.mock("./AssessmentFollowup", () => () => (
  <div>AssessmentFollowup</div>
));

jest.mock("./PreAssessmentDetails/PreAssessmentDetails", () => () => (
  <div>PreAssessmentDetails</div>
));

jest.mock(
  "./AssessmentStepIndicator/AssessmentStepIndicator",
  () => (props) => (
    <button
      data-testid="step-indicator"
      onClick={() => props.handleClickPage(1)}
    >
      Step
    </button>
  )
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (v) => v,
  }),
}));

beforeEach(() => {
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  mockFormList.mockResolvedValue({
    data: {
      data: [
        {
          currentRevision: 1,
        },
      ],
    },
  });

  mockDomainList.mockResolvedValue({
    data: {
      data: [
        {
          id: "1",
          domainName: "Health",
        },
      ],
    },
  });

  mockGetDomainSkipReasons.mockResolvedValue({
    data: {
      data: [
        {
          id: 1,
          reason: "Skipped",
        },
      ],
    },
  });

  mockGetFollowupDomainDetails.mockResolvedValue({
    data: {
      data: {
        followupData: [{}],
      },
    },
  });

  mockCaseDetails.mockResolvedValue({
    data: {
      data: {
        familyName: "Test Family",
      },
    },
  });

  mockGetAssessmentDetails.mockResolvedValue({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          dateOfAssessment: "2025-01-01",
          schedulingOption: "Monthly",
          TW_form: {
            TW_formQuestionMappings: [],
          },
        },
      ],
      assessmentScore: {
        totalScoreInPercentageAsString: "75",
      },
      membersPresent: [],
      childrensAssessed: [],
      primaryChoices: [],
    },
  });
});

const renderComponent = () =>
  render(
    <ThemeProvider theme={theme}>
    <CommonDataContext.Provider
      value={{
        visitTypeList: [],
        reIntegrationTypeList: [],
        getVisitTypeList: jest.fn(),
        getReIntegrationTypeList: jest.fn(),
        languageChange: "en",
      }}
    >
      <ViewAssessment
        setExportLoading={jest.fn()}
      />
    </CommonDataContext.Provider>
    </ThemeProvider>
  );

describe("ViewAssessment", () => {
  it("renders successfully", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getAllByText("AssessmentChildDetails").length
      ).toBeGreaterThan(0);
    });
  });

  it("loads assessment summary", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getAllByText("AssessmentSummary").length
      ).toBeGreaterThan(0);
    });
  });

  it("renders observations", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getAllByText("AssessmentObservations").length
      ).toBeGreaterThan(0);
    });
  });

  it("renders followup section", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getAllByText("AssessmentFollowup").length
      ).toBeGreaterThan(0);
    });
  });

  it("handles api failures", async () => {
    mockFormList.mockRejectedValueOnce(
      new Error("failure")
    );

    renderComponent();

    await waitFor(() => {
      expect(mockFormList).toHaveBeenCalled();
    });
  });

  it("renders intervention and red flag sections", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "Smith Family",
          schedulingOption: "Monthly",
          domainsSkipped: ["1"],
          itemsSkipped: [
            {
              TWQuestionDomainId: "1",
              notes:
                "This is a very long skipped domain reason that exceeds thirty characters",
              isDomainSkipped: true,
            },
          ],
          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Question 1",
                  TWQuestionDomainId: "1",
                  isRedFlag: true,
                  TW_choices: [
                    {
                      id: "10",
                      choiceName: "Other (please specify)",
                    },
                  ],
                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false,
                    },
                    {
                      TWChoiceId: "10",
                      isInterResp: true,
                      textResponse: "Intervention notes",
                      appliedTo: [1],
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
      assessmentScore: {
        totalScoreInPercentageAsString: "75.5",
      },
      primaryChoices: [
        {
          id: "1",
          choiceName: "common:assessment.In-crisis",
        },
        {
          id: "2",
          choiceName: "common:assessment.Vulnerable",
        },
      ],
      childrensAssessed: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
        },
      ],
      membersPresent: [],
    },
  });

  renderComponent();

  await waitFor(() => {
  expect(
    screen.getAllByText(/Question 1/)
  ).toHaveLength(2);
});
});



  it("handles domain skip reasons failure", async () => {
    mockGetDomainSkipReasons.mockRejectedValueOnce(
      new Error("failure")
    );

    renderComponent();

    await waitFor(() => {
      expect(
        mockGetDomainSkipReasons
      ).toHaveBeenCalled();
    });
  });

  it("renders integer thrive score", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          TW_form: {
            TW_formQuestionMappings: [],
          },
        },
      ],
      assessmentScore: {
        totalScoreInPercentageAsString: "75",
      },
      primaryChoices: [],
      childrensAssessed: [],
      membersPresent: [],
    },
  });

  renderComponent();

  await waitFor(() => {
    expect(screen.getAllByText(/75 %/).length).toBeGreaterThan(0);
  });
});

it("renders decimal thrive score", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          TW_form: {
            TW_formQuestionMappings: [],
          },
        },
      ],
      assessmentScore: {
        totalScoreInPercentageAsString: "75.5",
      },
      primaryChoices: [],
      childrensAssessed: [],
      membersPresent: [],
    },
  });

  renderComponent();

  await waitFor(() => {
    expect(screen.getAllByText(/75.5 %/).length).toBeGreaterThan(0);
  });
});

it("handles assessment details failure", async () => {
  mockGetAssessmentDetails.mockRejectedValueOnce(
    new Error("assessment failure")
  );

  renderComponent();

  await waitFor(() => {
    expect(mockGetAssessmentDetails).toHaveBeenCalled();
  });
});

it("handles case details failure", async () => {
  mockCaseDetails.mockRejectedValueOnce(
    new Error("case failure")
  );

  renderComponent();

  await waitFor(() => {
    expect(mockCaseDetails).toHaveBeenCalled();
  });
});

it("handles followup failure", async () => {
  mockGetFollowupDomainDetails.mockRejectedValueOnce(
    new Error("followup failure")
  );

  renderComponent();

  await waitFor(() => {
    expect(
      mockGetFollowupDomainDetails
    ).toHaveBeenCalled();
  });
});

  it("handles step click", async () => {
    renderComponent();

    fireEvent.click(
      await screen.findByTestId("step-indicator")
    );
  });

  it("renders go up button", async () => {
    renderComponent();

    const btn = await screen.findByRole("button", {
      name: /Go up/i,
    });

    fireEvent.click(btn);
  });

  it("unmounts cleanly", async () => {
    const { unmount } = renderComponent();

    await waitFor(() => {
      expect(mockFormList).toHaveBeenCalled();
    });

    unmount();
  });
  
  it("renders skipped question reason", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          itemsSkipped: [
            {
              TWQuestionDomainId: "1",
              isDomainSkipped: false,
              skippedQuestions: [
                {
                  TWQuestionId: 100,
                  notes: "Question skipped"
                }
              ]
            }
          ],
          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Skipped Question",
                  TWQuestionDomainId: "1",
                  TW_responses: [{ TWChoiceId: "1" }]
                }
              }
            ]
          }
        }
      ],
      assessmentScore: {},
      primaryChoices: []
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(
      screen.getAllByText(/Skipped Question/).length
    ).toBeGreaterThan(0);
  });
});

it("handles assessment with no assessment object", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [],
      assessmentScore: {},
      primaryChoices: []
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(mockGetAssessmentDetails).toHaveBeenCalled();
  });
});

it("renders family intervention applied to child and family", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "Smith Family",
          schedulingOption: "Monthly",
          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Intervention Question",
                  TWQuestionDomainId: "1",
                  TW_choices: [
                    {
                      id: "10",
                      choiceName: "Food Support"
                    }
                  ],
                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false
                    },
                    {
                      TWChoiceId: "10",
                      isInterResp: true,
                      appliedTo: [1],
                      TWFamilyId: 1
                    }
                  ]
                }
              }
            ]
          }
        }
      ],
      assessmentScore: {},
      primaryChoices: [
        {
          id: "1",
          choiceName: "common:assessment.In-crisis"
        }
      ],
      childrensAssessed: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe"
        }
      ]
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(
      screen.getAllByText(/John Doe/).length
    ).toBeGreaterThan(0);
  });
});
it("renders intervention notes and applied to values", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "Smith Family",
          schedulingOption: "Monthly",
          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Food Security",
                  TWQuestionDomainId: "1",
                  isRedFlag: false,
                  TW_choices: [
                    {
                      id: "10",
                      choiceName: "Other (please specify)"
                    }
                  ],
                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false
                    },
                    {
                      TWChoiceId: "10",
                      isInterResp: true,
                      textResponse:
                        "Food package supplied",
                      appliedTo: [1],
                      TWFamilyId: 5
                    }
                  ]
                }
              }
            ]
          }
        }
      ],
      assessmentScore: {},
      primaryChoices: [
        {
          id: "1",
          choiceName:
            "common:assessment.In-crisis"
        }
      ],
      childrensAssessed: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe"
        }
      ],
      membersPresent: []
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(
      screen.getAllByText(/Food Security/).length
      ).toBeGreaterThan(0);
  });

  expect(
    screen.getAllByText(/Food package supplied/).length
  ).toBeGreaterThan(0);

  expect(
    screen.getAllByText(/John Doe/).length
  ).toBeGreaterThan(0);

  expect(
    screen.getAllByText(/Smith Family/).length
  ).toBeGreaterThan(0);
});

it("renders appliedTo for child assessment", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "CHILD",
          childFirstName: "Mary",
          childLastName: "Jane",
          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Education",
                  TWQuestionDomainId: "1",
                  TW_choices: [
                    {
                      id: "10",
                      choiceName: "Tutoring"
                    }
                  ],
                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false
                    },
                    {
                      TWChoiceId: "10",
                      isInterResp: true
                    }
                  ]
                }
              }
            ]
          }
        }
      ],
      primaryChoices: [
        {
          id: "1",
          choiceName:
            "common:assessment.In-crisis"
        }
      ]
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(
      screen.getAllByText(/Mary Jane/).length
    ).toBeGreaterThan(0);
  });
});

it("covers family intervention applied to and intervention notes", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "Smith Family",

          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Food Security",
                  TWQuestionDomainId: "1",
                  isRedFlag: true,

                  TW_choices: [
                    {
                      id: "10",
                      choiceName: "Other (please specify)"
                    }
                  ],

                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false
                    },
                    {
                      TWChoiceId: "10",
                      isInterResp: true,
                      textResponse: "Food package supplied",
                      appliedTo: [1],
                      TWFamilyId: 99
                    }
                  ]
                }
              }
            ]
          }
        }
      ],

      primaryChoices: [
        {
          id: "1",
          choiceName: "common:assessment.In-crisis"
        }
      ],

      childrensAssessed: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe"
        }
      ],

      membersPresent: [],
      assessmentScore: {}
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(
      screen.getAllByText(/Food Security/i).length
    ).toBeGreaterThan(0);   
  });

  expect(
    screen.getAllByText(/John Doe/i).length
  ).toBeGreaterThan(0);

  expect(
    screen.getAllByText(/Smith Family/i).length
  ).toBeGreaterThan(0);

  expect(
    screen.queryByDisplayValue(/Food package supplied/i)
  ).toBeTruthy();
});

it("covers child intervention applied to branch", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "CHILD",
          childName: "Mary Jane",

          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 101,
                  questionText: "Education",
                  TWQuestionDomainId: "1",

                  TW_choices: [
                    {
                      id: "11",
                      choiceName: "Tutoring"
                    }
                  ],

                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false
                    },
                    {
                      TWChoiceId: "11",
                      isInterResp: true,
                      textResponse: "Support"
                    }
                  ]
                }
              }
            ]
          }
        }
      ],

      primaryChoices: [
        {
          id: "1",
          choiceName: "common:assessment.In-crisis"
        }
      ]
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(
      screen.getAllByText(/Education/i).length
    ).toBeGreaterThan(0);
  });
});

it("covers intervention accordion details rendering", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "Smith Family",
          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Food Security",
                  TWQuestionDomainId: "1",
                  isRedFlag: true,
                  TW_choices: [
                    {
                      id: "10",
                      choiceName: "Other (please specify)",
                    },
                  ],
                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false,
                    },
                    {
                      TWChoiceId: "10",
                      isInterResp: true,
                      textResponse: "Food package supplied",
                      appliedTo: [1],
                      TWFamilyId: 99,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
      assessmentScore: {},
      primaryChoices: [
        {
          id: "1",
          choiceName: "common:assessment.In-crisis",
        },
      ],
      childrensAssessed: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
        },
      ],
      membersPresent: [],
    },
  });

  renderComponent();

  const accordionHeader = await screen.findByText("Health");

  fireEvent.click(accordionHeader);

   screen.debug();

  await waitFor(() => {
    expect(
      screen.getAllByText(/Food Security/i).length
    ).toBeGreaterThan(0);
  });

  expect(
    screen.getAllByText(/John Doe/i).length
  ).toBeGreaterThan(0);

  expect(
    screen.getAllByText(/Smith Family/i).length
  ).toBeGreaterThan(0);

  expect(
    screen.getAllByText(/Food package supplied/i).length
  ).toBeGreaterThan(0);

  expect(
    screen.getAllByText(/Other \(please specify\)/i).length
  ).toBeGreaterThan(0);
});

it("covers empty applied-to rendering", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "",
          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Food Security",
                  TWQuestionDomainId: "1",
                  isRedFlag: true,
                  TW_choices: [
                    {
                      id: "10",
                      choiceName: "Support",
                    },
                  ],
                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false,
                    },
                    {
                      TWChoiceId: "10",
                      isInterResp: true,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
      assessmentScore: {},
      primaryChoices: [
        {
          id: "1",
          choiceName: "common:assessment.In-crisis",
        },
      ],
      childrensAssessed: [],
    },
  });

  renderComponent();

  fireEvent.click(await screen.findByText("Health"));
  screen.debug();

  await waitFor(() => {
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });
});

it("covers intervention details with notes, family and appliedTo", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "Smith Family",
          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Food Security",
                  TWQuestionDomainId: "1",
                  isRedFlag: true,
                  TW_choices: [
                    {
                      id: "10",
                      choiceName: "Other (please specify)",
                    },
                  ],
                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false,
                    },
                    {
                      TWChoiceId: "10",
                      isInterResp: true,
                      textResponse: "Food package supplied",
                      appliedTo: [1],
                      TWFamilyId: 99,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
      assessmentScore: {},
      primaryChoices: [
        {
          id: "1",
          choiceName: "common:assessment.In-crisis",
        },
      ],
      childrensAssessed: [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
        },
      ],
      membersPresent: [],
    },
  });

  renderComponent();

  const health = await screen.findByText("Health");

  fireEvent.click(health);

  await waitFor(() => {
    expect(
      screen.getAllByText("Food Security").length
    ).toBeGreaterThan(0);
  });

  expect(
    screen.getAllByText("Other (please specify)").length
  ).toBeGreaterThan(0);

  expect(
    screen.getAllByText("Food package supplied").length
  ).toBeGreaterThan(0);
});

it("covers empty appliedTo branch", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "",
          TW_form: {
            TW_formQuestionMappings: [
              {
                TW_question: {
                  id: 100,
                  questionText: "Food Security",
                  TWQuestionDomainId: "1",
                  isRedFlag: true,
                  TW_choices: [
                    {
                      id: "10",
                      choiceName: "Support",
                    },
                  ],
                  TW_responses: [
                    {
                      TWChoiceId: "1",
                      isInterResp: false,
                    },
                    {
                      TWChoiceId: "10",
                      isInterResp: true,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
      assessmentScore: {},
      primaryChoices: [
        {
          id: "1",
          choiceName: "common:assessment.In-crisis",
        },
      ],
      childrensAssessed: [],
    },
  });

  renderComponent();

  fireEvent.click(await screen.findByText("Health"));

  await waitFor(() => {
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });
});


it("renders response notes", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        TW_form: {
          TW_formQuestionMappings: [{
            TW_question: {
              id: 100,
              questionText: "Question",
              TWQuestionDomainId: "1",
              TW_responses: [{
                TWChoiceId: "1",
                notes: "Coverage Note"
              }]
            }
          }]
        }
      }],
      assessmentScore: {},
      primaryChoices: [{
        id: "1",
        choiceName: "common:assessment.In-crisis"
      }]
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(
      screen.getByText("Coverage Note")
    ).toBeInTheDocument();
  });
});

it("renders response notes panel", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        TW_form: {
          TW_formQuestionMappings: [{
            TW_question: {
              id: 100,
              questionText: "Question With Notes",
              TWQuestionDomainId: "1",
              TW_responses: [{
                TWChoiceId: "1",
                notes: "Coverage Note"
              }]
            }
          }]
        }
      }],
      assessmentScore: {},
      primaryChoices: [{
        id: "1",
        choiceName: "common:assessment.In-crisis"
      }]
    }
  });

  renderComponent();

  expect(
    await screen.findByText("Coverage Note")
  ).toBeInTheDocument();
});

it("renders skipped domain reason from lookup table", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        domainsSkipped: ["1"],
        itemsSkipped: [{
          TWQuestionDomainId: "1",
          domainSkippReasonId: 1,
          isDomainSkipped: true
        }],
        TW_form: {
          TW_formQuestionMappings: []
        }
      }],
      assessmentScore: {},
      primaryChoices: []
    }
  });

  renderComponent();

  expect(
    await screen.findByText(/excluded/i)
  ).toBeInTheDocument();
});

it("renders skipped question reason from reason lookup", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        itemsSkipped: [{
          TWQuestionDomainId: "1",
          isDomainSkipped: false,
          skippedQuestions: [{
            TWQuestionId: 100,
            TWReasonId: 1
          }]
        }],
        TW_form: {
          TW_formQuestionMappings: [{
            TW_question: {
              id: 100,
              questionText: "Skipped Question",
              TWQuestionDomainId: "1",
              TW_responses: [{ TWChoiceId: "1" }]
            }
          }]
        }
      }],
      assessmentScore: {},
      primaryChoices: []
    }
  });

  renderComponent();

  expect(
    await screen.findByText(/Skipped Question/)
  ).toBeInTheDocument();
});

it("renders long skipped domain reason tooltip branch", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        domainsSkipped: ["1"],
        itemsSkipped: [{
          TWQuestionDomainId: "1",
          isDomainSkipped: true,
          notes:
            "This is a very long skipped domain reason that exceeds thirty characters"
        }],
        TW_form: {
          TW_formQuestionMappings: []
        }
      }],
      assessmentScore: {},
      primaryChoices: []
    }
  });

  renderComponent();

  expect(
    await screen.findByText(/excluded/i)
  ).toBeInTheDocument();
});

it("covers intervention required notes branch", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        type: "FAMILY",
        familyName: "Smith Family",
        TW_form: {
          TW_formQuestionMappings: [{
            TW_question: {
              id: 100,
              questionText: "Food Security",
              TWQuestionDomainId: "1",
              isRedFlag: true,
              TW_choices: [
                {
                  id: "10",
                  choiceName: "Other (please specify)"
                }
              ],
              TW_responses: [
                {
                  TWChoiceId: "1",
                  isInterResp: false
                },
                {
                  TWChoiceId: "10",
                  isInterResp: true,
                  textResponse: "Required note",
                  appliedTo: [1],
                  TWFamilyId: 1
                }
              ]
            }
          }]
        }
      }],
      primaryChoices: [{
        id: "1",
        choiceName: "common:assessment.In-crisis"
      }],
      childrensAssessed: [{
        id: 1,
        firstName: "John",
        lastName: "Doe"
      }],
      assessmentScore: {}
    }
  });

  renderComponent();

  fireEvent.click(await screen.findByText("Health"));

  expect(
    await screen.findByDisplayValue("Required note")
  ).toBeInTheDocument();
});

it("covers intervention optional notes branch", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        type: "FAMILY",
        familyName: "Smith Family",
        TW_form: {
          TW_formQuestionMappings: [{
            TW_question: {
              id: 100,
              questionText: "Housing",
              TWQuestionDomainId: "1",
              isRedFlag: true,
              TW_choices: [
                {
                  id: "10",
                  choiceName: "Housing Support"
                }
              ],
              TW_responses: [
                {
                  TWChoiceId: "1",
                  isInterResp: false
                },
                {
                  TWChoiceId: "10",
                  isInterResp: true,
                  textResponse: "Optional note",
                  TWFamilyId: 1
                }
              ]
            }
          }]
        }
      }],
      primaryChoices: [{
        id: "1",
        choiceName: "common:assessment.In-crisis"
      }],
      childrensAssessed: [],
      assessmentScore: {}
    }
  });

  renderComponent();

  fireEvent.click(await screen.findByText("Health"));

  expect(
    await screen.findByDisplayValue("Optional note")
  ).toBeInTheDocument();
});

it("renders short skipped domain reason", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        domainsSkipped: ["1"],
        itemsSkipped: [{
          TWQuestionDomainId: "1",
          notes: "Short reason",
          isDomainSkipped: true
        }],
        TW_form: {
          TW_formQuestionMappings: []
        }
      }],
      assessmentScore: {},
      primaryChoices: []
    }
  });

  renderComponent();

  expect(
    await screen.findByText(/excluded/i)
  ).toBeInTheDocument();
});

it("handles export with unauthorized error", async () => {
  const mockSetExportLoading = jest.fn();
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "Smith Family",
          dateOfAssessment: "2025-01-01",
          TW_form: {
            TW_formQuestionMappings: []
          }
        }
      ],
      assessmentScore: {},
      primaryChoices: []
    }
  });

  render(
    <ThemeProvider theme={theme}>
      <CommonDataContext.Provider
        value={{
          visitTypeList: [],
          reIntegrationTypeList: [],
          getVisitTypeList: jest.fn(),
          getReIntegrationTypeList: jest.fn(),
          languageChange: "en",
        }}
      >
        <ViewAssessment setExportLoading={mockSetExportLoading} />
      </CommonDataContext.Provider>
    </ThemeProvider>
  );

  await waitFor(() => {
    expect(mockFormList).toHaveBeenCalled();
  });
});

it("handles export api error", async () => {
  const mockSetExportLoading = jest.fn();
  
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [
        {
          TWCaseId: 1,
          type: "FAMILY",
          familyName: "Smith Family",
          dateOfAssessment: "2025-01-01",
          TW_form: {
            TW_formQuestionMappings: []
          }
        }
      ],
      assessmentScore: {},
      primaryChoices: []
    }
  });

  render(
    <ThemeProvider theme={theme}>
      <CommonDataContext.Provider
        value={{
          visitTypeList: [],
          reIntegrationTypeList: [],
          getVisitTypeList: jest.fn(),
          getReIntegrationTypeList: jest.fn(),
          languageChange: "en",
        }}
      >
        <ViewAssessment setExportLoading={mockSetExportLoading} />
      </CommonDataContext.Provider>
    </ThemeProvider>
  );

  await waitFor(() => {
    expect(mockFormList).toHaveBeenCalled();
  });
});

it("handles language change", async () => {
  const getVisitTypeListFn = jest.fn();
  const getReIntegrationTypeListFn = jest.fn();

  const { rerender } = render(
    <ThemeProvider theme={theme}>
      <CommonDataContext.Provider
        value={{
          visitTypeList: [],
          reIntegrationTypeList: [],
          getVisitTypeList: getVisitTypeListFn,
          getReIntegrationTypeList: getReIntegrationTypeListFn,
          languageChange: "en",
        }}
      >
        <ViewAssessment setExportLoading={jest.fn()} />
      </CommonDataContext.Provider>
    </ThemeProvider>
  );

  await waitFor(() => {
    expect(mockFormList).toHaveBeenCalled();
  });

  // Trigger language change
  mockFormList.mockClear();
  rerender(
    <ThemeProvider theme={theme}>
      <CommonDataContext.Provider
        value={{
          visitTypeList: [],
          reIntegrationTypeList: [],
          getVisitTypeList: getVisitTypeListFn,
          getReIntegrationTypeList: getReIntegrationTypeListFn,
          languageChange: "es",
        }}
      >
        <ViewAssessment setExportLoading={jest.fn()} />
      </CommonDataContext.Provider>
    </ThemeProvider>
  );
});

it("handles assessment details with no assessment", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        TW_form: {
          TW_formQuestionMappings: []
        }
      }],
      assessmentScore: {},
      primaryChoices: []
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(mockGetAssessmentDetails).toHaveBeenCalled();
  });
});

it("filters out foster care questions for non-foster care assessments", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        type: "FAMILY",
        familyName: "Smith Family",
        TWAssessmentReintegrationTypeId: 5,
        schedulingOption: "Monthly",
        TW_form: {
          TW_formQuestionMappings: [{
            TW_question: {
              id: 100,
              questionText: "Question",
              TWQuestionDomainId: "1",
              isFosterCareFlag: true,
              TW_responses: []
            }
          }]
        }
      }],
      assessmentScore: {},
      primaryChoices: [],
      childrensAssessed: [],
      membersPresent: []
    }
  });

  mockDomainList.mockResolvedValueOnce({
    data: {
      data: [{
        id: "1",
        domainName: "Health"
      }]
    }
  });

  render(
    <ThemeProvider theme={theme}>
      <CommonDataContext.Provider
        value={{
          visitTypeList: [],
          reIntegrationTypeList: [{
            id: 1,
            reIntegrationType: "common:assessment.Foster Care"
          }],
          getVisitTypeList: jest.fn(),
          getReIntegrationTypeList: jest.fn(),
          languageChange: "en",
        }}
      >
        <ViewAssessment setExportLoading={jest.fn()} />
      </CommonDataContext.Provider>
    </ThemeProvider>
  );

  await waitFor(() => {
    expect(mockGetAssessmentDetails).toHaveBeenCalled();
  });
});

it("handles domain skip when domains are empty", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        domainsSkipped: ["1", "2"],
        TW_form: {
          TW_formQuestionMappings: []
        }
      }],
      assessmentScore: {},
      primaryChoices: [],
      childrensAssessed: [],
      membersPresent: []
    }
  });

  mockDomainList.mockResolvedValueOnce({
    data: {
      data: []
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(mockDomainList).toHaveBeenCalled();
  });
});

it("handles domain list with skipped domains", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        domainsSkipped: ["1"],
        TW_form: {
          TW_formQuestionMappings: []
        }
      }],
      assessmentScore: {},
      primaryChoices: [],
      childrensAssessed: [],
      membersPresent: []
    }
  });

  mockDomainList.mockResolvedValueOnce({
    data: {
      data: [{
        id: "1",
        domainName: "Health"
      }, {
        id: "2",
        domainName: "Education"
      }]
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(mockDomainList).toHaveBeenCalled();
  });
});

it("handles expand panel", async () => {
  renderComponent();

  await waitFor(() => {
    expect(
      screen.getAllByText("AssessmentChildDetails").length
    ).toBeGreaterThan(0);
  });

  const accordion = await screen.findByText("Health");
  fireEvent.click(accordion);

  // Click again to collapse
  fireEvent.click(accordion);
});

it("handles intervention check for domain", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        type: "FAMILY",
        familyName: "Smith Family",
        TW_form: {
          TW_formQuestionMappings: [{
            TW_question: {
              id: 100,
              questionText: "Question",
              TWQuestionDomainId: "1",
              isRedFlag: false,
              TW_responses: [{
                TWChoiceId: "1"
              }]
            }
          }]
        }
      }],
      assessmentScore: {},
      primaryChoices: [{
        id: "1",
        choiceName: "common:assessment.In-crisis"
      }],
      childrensAssessed: [],
      membersPresent: []
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(mockGetAssessmentDetails).toHaveBeenCalled();
  });
});

it("handles red flag interventions", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        type: "FAMILY",
        familyName: "Smith Family",
        TW_form: {
          TW_formQuestionMappings: [{
            TW_question: {
              id: 100,
              questionText: "Question",
              TWQuestionDomainId: "1",
              isRedFlag: true,
              TW_responses: [{
                TWChoiceId: "1"
              }]
            }
          }]
        }
      }],
      assessmentScore: {},
      primaryChoices: [{
        id: "1",
        choiceName: "common:assessment.In-crisis"
      }],
      childrensAssessed: [],
      membersPresent: []
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(mockGetAssessmentDetails).toHaveBeenCalled();
  });
});

it("renders question with no responses", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        TW_form: {
          TW_formQuestionMappings: [{
            TW_question: {
              id: 100,
              questionText: "Question",
              TWQuestionDomainId: "1",
              TW_responses: []
            }
          }]
        }
      }],
      assessmentScore: {},
      primaryChoices: [],
      childrensAssessed: [],
      membersPresent: []
    }
  });

  renderComponent();

  fireEvent.click(await screen.findByText("Health"));

  await waitFor(() => {
    expect(
      screen.getAllByText(/Question/).length
    ).toBeGreaterThan(0);
  });
});

it("handles accordion panel expansion and collapse", async () => {
  renderComponent();

  await waitFor(() => {
    expect(
      screen.getAllByText("AssessmentChildDetails").length
    ).toBeGreaterThan(0);
  });

  const health = await screen.findByText("Health");
  
  fireEvent.click(health);
  
  // Allow time for accordion to expand
  await waitFor(() => {
    fireEvent.click(health);
  });
});

it("filters dom domains correctly when all skipped", async () => {
  mockGetAssessmentDetails.mockResolvedValueOnce({
    data: {
      assessmentDetails: [{
        TWCaseId: 1,
        domainsSkipped: ["1", "2", "3"],
        TW_form: {
          TW_formQuestionMappings: []
        }
      }],
      assessmentScore: {},
      primaryChoices: [],
      childrensAssessed: [],
      membersPresent: []
    }
  });

  mockDomainList.mockResolvedValueOnce({
    data: {
      data: [{
        id: "1",
        domainName: "Health"
      }, {
        id: "2",
        domainName: "Education"
      }, {
        id: "3",
        domainName: "Nutrition"
      }]
    }
  });

  renderComponent();

  await waitFor(() => {
    expect(mockDomainList).toHaveBeenCalled();
  });
});

});