import axios from "axios";

const addGreptcha = () => {
  const recaptcha_script = document.createElement("script");
  recaptcha_script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}`;
  recaptcha_script.id = "recaptcha";
  document.head.append(recaptcha_script);

  // clean up
  return () => {
    recaptcha_script.remove();
  };
};

const getCaptchaScore = async () => {
  const score = await grecaptcha
    .execute(process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY, { action: "submit" })
    .then((token) => axios.get(
        `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/v1/user_scores`,
        { params: { token } }
    )).then((response) => response.data.score );

  return score;
};

export { addGreptcha, getCaptchaScore };
export const handleUnauthorized = (error, router) => {
  // console.log(window.location.pathname);
  // console.log(error.response);
  if (error.response && error.response.statusText === 'Unauthorized') {
    // console.log(error.response);

    localStorage.token = '';

    router.push({
      pathname: '/login',
      // after login redirect to intended page
      query: { returnUrl: window.location.pathname },
    });
  }
};
