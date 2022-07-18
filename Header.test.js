import {cleanup, fireEvent, render} from "@testing-library/react";import i18n from "i18next";import {initReactI18next} from "react-i18next";import {resources} from "../i18n/locales/resources";import {BrowserRouter} from "react-router-dom";import Header from "../components/Header";describe("<Header />컴포넌트", () => {    afterEach(cleanup);    beforeEach(() => {        i18n            .use(initReactI18next) // passes i18n down to react-i18next            .init({                resources,                lng: "en",                keySeparator: false, // we do not use keys in form messages.welcome                interpolation: {                    escapeValue: false, // react already safes from xss                },            });    });    it("로고가 존재해야합니다.", () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const logo = container.querySelectorAll("img")[0]        expect(logo).toHaveAttribute('src', '../../all4land_CI_en_bl.png');    });    it("로고 이미지의 alt가 존재해야합니다..", () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const logo = container.querySelectorAll("img")[0]        expect(logo).toHaveAttribute('alt', '브랜드로고입니다.클릭 시 홈으로 이동합니다.');    });    it("로고 클릭 시 루트페이지로 돌아가야합니다.", async () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const logo = container.querySelectorAll("img")[0]        // expect(logo).toHaveAttribute('alt', '브랜드로고입니다.클릭 시 홈으로 이동합니다.');        fireEvent.click(logo)        // await wait();        expect(global.window.location.pathname).toEqual('/')    });    it("className `internationalization`: 한/영 언어 변경 이미지 버튼이 존재해야합니다.", () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const internationalization = container.querySelector(".internationalization")        expect(internationalization).toBeInTheDocument()    });    it("className `internationalization`: 국제화 디폴트 언어는 영어입니다.", () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        expect(i18n.language).toBe('en');    });    it("className `internationalization`: 한/영 언어 변경 이미지 버튼을 눌렀을 때, 언어타입이 변경되어야 합니다.", () => {        const {container} = render(<BrowserRouter><Header  /></BrowserRouter>);        const internationalization = container.querySelector(".internationalization")        fireEvent.click(internationalization)        expect(i18n.language).toBe('ko');        fireEvent.click(internationalization)        expect(i18n.language).toBe('en');    });});