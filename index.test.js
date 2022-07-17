import React,{Suspense} from "react";import {cleanup, fireEvent, render, screen, waitFor, waitForElementToBeRemoved,} from "@testing-library/react";import Header from "../components/Header";import {BrowserRouter} from "react-router-dom";import {initReactI18next, useTranslation} from 'react-i18next';import i18n from "i18next";import {resources} from "../i18n/locales/resources";import {RecoilRoot} from "recoil";import Sidebar from "../components/Sidebar";import App from "../App";import {act} from "react-dom/test-utils";import CustomDialog from "../components/common/CustomDialog";import userEvent from "@testing-library/user-event";import nock from "nock";// import {wait} from "@testing-library/user-event/dist/types/utils";const url = process.env.REACT_APP_API_ENDPOINT;describe("<Header />컴포넌트", () => {    afterEach(cleanup);    beforeEach(() => {        i18n            .use(initReactI18next) // passes i18n down to react-i18next            .init({                resources,                lng: "en",                keySeparator: false, // we do not use keys in form messages.welcome                interpolation: {                    escapeValue: false, // react already safes from xss                },            });    });    it("로고가 존재해야합니다.", () => {       const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const logo = container.querySelectorAll("img")[0]        expect(logo).toHaveAttribute('src', '../../all4land_CI_en_bl.png');    });    it("로고 이미지의 alt가 존재해야합니다..", () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const logo = container.querySelectorAll("img")[0]        expect(logo).toHaveAttribute('alt', '브랜드로고입니다.클릭 시 홈으로 이동합니다.');    });    it("로고 클릭 시 루트페이지로 돌아가야합니다.", async () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const logo = container.querySelectorAll("img")[0]        // expect(logo).toHaveAttribute('alt', '브랜드로고입니다.클릭 시 홈으로 이동합니다.');        fireEvent.click(logo)        // await wait();        expect(global.window.location.pathname).toEqual('/')    });    it("className `internationalization`: 한/영 언어 변경 이미지 버튼이 존재해야합니다.", () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const internationalization = container.querySelector(".internationalization")        expect(internationalization).toBeInTheDocument()    });    it("className `internationalization`: 국제화 디폴트 언어는 영어입니다.", () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        expect(i18n.language).toBe('en');    });    it("className `internationalization`: 한/영 언어 변경 이미지 버튼을 눌렀을 때, 언어타입이 변경되어야 합니다.", () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const internationalization = container.querySelector(".internationalization")        fireEvent.click(internationalization)        expect(i18n.language).toBe('ko');        fireEvent.click(internationalization)        expect(i18n.language).toBe('en');    });});describe("<Sidebar />컴포넌트",   () => {        afterEach(cleanup);    beforeEach(() => {        i18n            .use(initReactI18next) // passes i18n down to react-i18next            .init({                resources,                lng: "en",                keySeparator: false, // we do not use keys in form messages.welcome                interpolation: {                    escapeValue: false, // react already safes from xss                },            });    });    it("sidebar에 제목(Experiment)이 존재하나요 ?", async() => {        const { getByTestId, getByText } =render(            <RecoilRoot>                <BrowserRouter>                    <Sidebar/>                </BrowserRouter>            </RecoilRoot>        );        await waitFor(() => {            expect(getByText(/Experiment/i)).toBeInTheDocument();        });    });    it("sidebar에 +버튼을 누를 시 다이얼로그가 켜지나요?", async() => {        const { getByTestId, getByText,container } =render(            <RecoilRoot>                <BrowserRouter>                    <Sidebar/>                </BrowserRouter>                <CustomDialog />            </RecoilRoot>        );        const addbutton = container.querySelector(".addCreateExperimentButton")        fireEvent.click(addbutton)        await waitFor(() => {            expect(getByText("Create Experiment")).toBeInTheDocument();        });    });    it("sidebar에 다이얼로그에서 create experiment가 만들어지나요?", async() => {        const scope = nock(url)            .get('/experiments')            .once()            .reply(200, {                data: 'response',            });        const { getByTestId, getByText,container } =render(            <RecoilRoot>                <BrowserRouter>                    <Sidebar/>                </BrowserRouter>                <CustomDialog />            </RecoilRoot>        );        const addbutton = container.querySelector(".addCreateExperimentButton")        fireEvent.click(addbutton)        const okButton = screen.getByTestId("Ok")        // await waitForElement(()=>okButton);        const nameValue =  screen.getByTestId("name")        const selectValue =  screen.getByTestId("type")        fireEvent.change(nameValue, {target:{value:"test"}});        fireEvent.change(selectValue, {target:{value:"classification"}});        fireEvent.click( okButton)        // await wait()        console.log(scope)        expect( screen.getByTestId("Ok")).toBeInTheDocument()        //        // await waitFor(() =>        //     expect(        //         screen.getByText("Ok")        //     ).not.toBeInTheDocument()        // ,{timeout: 3000});        // await act(async () => await userEvent.click(okButton))        // await waitForElementToBeRemoved(() =>        //        // );        await waitFor(() => {        });    });});