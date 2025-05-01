/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { lazy } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { FaultProvider } from "@components/fault";
import Protected from "@components/protected";
import { LangProvider } from "@components/language";

const root = document.getElementById("root");

const Landing = lazy(() => import("./pages/home/landing.page"));
const Product = lazy(() => import("./pages/product/product.page"));
const Blogs = lazy(() => import("./pages/blogs/blogs.page"));
const Support = lazy(() => import("./pages/support/support.page"));
const Privacy = lazy(() => import("./pages/policies/privacy.page"));
const TermService = lazy(() => import("./pages/policies/service.page"));
const AboutUs = lazy(() => import("./pages/support/aboutus.page"));
const Signin = lazy(() => import("./pages/auth/signin.page"));
const Signup = lazy(() => import("./pages/auth/signup.page"));
const Verify = lazy(() => import("./pages/auth/verify.page"));
const RecoverPassword = lazy(() => import("./pages/auth/recover.page"));
const Pricing = lazy(() => import("./pages/pricing/pricing.page"));
const Error404 = lazy(() => import("./pages/error/error.404.page"));
const ErrorPayment = lazy(() => import("./pages/error/error.payment.page"));

// Blogs Import
const Blog1 = lazy(
	() => import("./pages/blogs/blog/blog.from-rejections-to-offers")
);

// Protected Pages
const Home = Protected({ fallback: Landing })(
	lazy(() => import("./pages/home/home.page"))
);
const Account = Protected({ redirect: "/" })(
	lazy(() => import("./pages/auth/account.page"))
);
const Resume = Protected({ redirect: "/" })(
	lazy(() => import("./pages/resume/resume.page"))
);
const History = Protected({ redirect: "/" })(
	lazy(() => import("./pages/resume/history.page"))
);
const Templates = Protected({ redirect: "/" })(
	lazy(() => import("./pages/home/template.page"))
);

render(
	() => (
		<FaultProvider>
			<LangProvider>
			<Router>
				<Route path={["/", "/home"]} component={Home} />
				<Route path={"/welcolm"} component={Landing} />
				<Route path={"/product"} component={Product} />
				<Route path={"/support"} component={Support} />
				<Route path={"/blogs"} component={Blogs} />
				<Route path={"/policies/privacy"} component={Privacy} />
				<Route
					path={"/policies/term-of-services"}
					component={TermService}
				/>
				<Route path={"/about-us"} component={AboutUs} />
				<Route path={"/signin"} component={Signin} />
				<Route path={"/signup"} component={Signup} />
				<Route path={"/verify-account"} component={Verify} />
				<Route path={"/forgot-password"} component={RecoverPassword} />
				<Route path={"/my-templates"} component={Templates} />
				<Route path={"/pricing"} component={Pricing} />
				<Route path={"/fail"} component={ErrorPayment} />
				<Route path={"/account"} component={Account} />
				<Route path={"/history"} component={History} />
				<Route path={"/resume/:id"} component={Resume} />
				<Route path={"*"} component={Error404} />

				{/* Blogs */}
				<Route
					path={"/blogs/from-rejections-to-offers"}
					component={Blog1}
				/>
			</Router>
			</LangProvider>
		</FaultProvider>
	),
	root!
);
