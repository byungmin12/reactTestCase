import React, { Suspense } from "react";
import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { initReactI18next } from "react-i18next";
import i18n from "i18next";
import { resources } from "../i18n/locales/resources";
import { RecoilRoot } from "recoil";
import Sidebar from "../components/Sidebar";
import CustomDialog from "../components/common/CustomDialog";
import nock from "nock";
import {
  postExperiment,
  useExperimentList,
} from "../service/experiment/experimentService";
import { renderWithRouterTag } from "../testUtil/customUtils";
import SWRConfig from "swr";
import { wait } from "@testing-library/user-event/dist/utils";
import App from "../App";
// import {wait} from "@testing-library/user-event/dist/types/utils";

const url = process.env.REACT_APP_API_ENDPOINT;
export const serverGetData = {
  classificationGroup: [
    {
      experimentId: 0,
      name: "test_classification",
      artifactLocation: "/mlflow_artifacts/0",
      lifecycleStage: "active",
      type: "classification",
      description: "train classfication",
    },
  ],
  objectDetectionGroup: [
    {
      experimentId: 1,
      name: "test_objectDetection",
      artifactLocation: "/mlflow_artifacts/1",
      lifecycleStage: "active",
      type: "objectDetection",
      description: "test object-detection",
    },
  ],
  segmentationGroup: [
    {
      experimentId: 2,
      name: "test_segmentation",
      artifactLocation: "/mlflow_artifacts/2",
      lifecycleStage: "active",
      type: "segmentation",
      description: "test object-detection",
    },
  ],
};

describe("<Sidebar />컴포넌트", () => {
  afterEach(cleanup);

  beforeAll(() => {
    i18n
      .use(initReactI18next) // passes i18n down to react-i18next
      .init({
        resources,
        lng: "en",

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
          escapeValue: false, // react already safes from xss
        },
      });
    nock(url)
      .persist()
      .defaultReplyHeaders({
        "access-control-allow-origin": "*",
        "access-control-allow-credentials": "true",
      })
      .get("/experiments")
      .once()
      .reply(200, serverGetData);
  });

  it("sidebar에 제목(Experiment)이 존재하나요 ?", async () => {
    const { getByTestId, getByText, container, debug } = renderWithRouterTag(
      <Sidebar />,
      RecoilRoot
    );

    await waitFor(() => {
      expect(getByText(/Experiment/i)).toBeInTheDocument();
    });
  });

  it("sidebar에 +버튼을 누를 시 다이얼로그가 켜지나요?", async () => {
    const { getByTestId, getByText, container, debug } = renderWithRouterTag(
      <>
        <Sidebar />
        <CustomDialog />
      </>,
      RecoilRoot
    );
    const addbutton = container.querySelector(".addCreateExperimentButton");
    fireEvent.click(addbutton);
    expect(getByText("Create Experiment")).toBeInTheDocument();
  });

  it("sidebar에 다이얼로그에서 {name: test, type: classification}을 넣어줄 시 create experiment가 만들어지나요?", async () => {
    nock(url)
      .persist()
      .defaultReplyHeaders({
        "access-control-allow-origin": "*",
        "access-control-allow-credentials": "true",
      })
      .post("/experiments", { name: "test", type: "classification" })
      .once()
      .reply(201, {
        data: "response",
      });

    const { getByTestId, getByText, container, debug } = renderWithRouterTag(
      <>
        <Suspense>
          <Sidebar />
        </Suspense>
        <CustomDialog />
      </>,
      RecoilRoot
    );

    const addbutton = container.querySelector(".addCreateExperimentButton");
    fireEvent.click(addbutton);
    const okButton = screen.getByTestId("Ok");
    // await waitForElement(()=>okButton);
    const nameValue = screen.getByTestId("name");
    const selectValue = screen.getByTestId("type");
    fireEvent.change(nameValue, { target: { value: "test" } });
    fireEvent.change(selectValue, { target: { value: "classification" } });
    fireEvent.click(okButton);

    const res = await postExperiment({
      name: nameValue.value,
      type: selectValue.value,
    });
    expect(res.status).toEqual(201);
  });

  it("Experiment list data를 받아와야합니다.", async () => {
    const { getByTestId, getAllByRole, container, baseElement } =
      renderWithRouterTag(
        <>
          <Suspense>
            <Sidebar />
          </Suspense>
          <CustomDialog />
        </>,
        RecoilRoot
      );
    expect(getAllByRole("categoryUi")).toHaveLength(3);
    expect(getAllByRole("categoryLi")).toHaveLength(3);
  });

  describe("사이드메뉴를 클릭하면 해당하는 Experiment page가 렌더링", () => {
    beforeEach(() => {
      nock(url)
        .persist()
        .defaultReplyHeaders({
          "access-control-allow-origin": "*",
          "access-control-allow-credentials": "true",
        })
        .get("/experiments/0/run")
        .once()
        .reply(200, [
          {
            experimentId: 2,
            runId: "bf3677fa0ccf49fe924a85daa48156ba",
            startTime: "",
            endTime: "",
            status: "",
            lifecycleState: "activate",
            duration: "",
            runName: "",
            models: "",
            metrics: "",
          },
        ]);
    });

    it("Experiment list data를 받아와야합니다.", async () => {
      const { getByTestId, getByText, container, debug, getByRole } = render(
        <App />
      );
      const regexp = new RegExp(serverGetData.classificationGroup[0].name, "i");
      const experiment = screen.getByText(regexp);
      fireEvent.click(experiment);

      await wait();
      expect(global.window.location.pathname).toEqual(
        `/${serverGetData.classificationGroup[0].experimentId}`
      );
    });
  });
});
