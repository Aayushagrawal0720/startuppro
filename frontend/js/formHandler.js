let startupRegData = {
  startupDetails: {},
  founderDetails: {},
  jobDetails: {},
};
const startupForm = document.getElementById("startup-reg-form");
startupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  startupRegData.startupDetails.startup_name = startupForm.elements.startup_name.value;
  startupRegData.startupDetails.mobile_no = parseInt(startupForm.elements.mobile_no.value);
  startupRegData.startupDetails.password = startupForm.elements.password.value;
  startupRegData.startupDetails.confirm_password = startupForm.elements.confirm_password.value;
  startupRegData.startupDetails.email_official = startupForm.elements.email_official.value;
  startupRegData.startupDetails.email_personal = startupForm.elements.email_personal.value;
  startupRegData.startupDetails.start_date = startupForm.elements.start_date.value;
  startupRegData.startupDetails.state = startupForm.elements.state.value;
  startupRegData.startupDetails.city = startupForm.elements.city.value;
  startupRegData.startupDetails.zip_code = parseInt(startupForm.elements.zip_code.value);
  startupRegData.startupDetails.Industry = startupForm.elements.Industry.value;
  startupRegData.startupDetails.description_of_idea = startupForm.elements.description_of_idea.value;
  startupRegData.startupDetails.about_company = startupForm.elements.about_company.value;
  startupRegData.startupDetails.website_link = startupForm.elements.website_link.value;

  if (startupRegData.startupDetails.password != startupRegData.startupDetails.confirm_password) {
    alert("Passwords do not match");
    throw new Error("Passwords do not match");
  }

  const heading = document.getElementById("form-heading");
  heading.innerText = "Founder Register";
  const container = document.getElementById("form-container");
  container.innerHTML = `<form id="founder-reg-form">
  <div class="row">
    <div class="col-md-6 parent">
      <label class="mb-0 ml-0 star">Founder Name</label><br />
      <input
        type="text"
        name="member_name"
        placeholder="Founder Name"
        class="p-1 outline"
        required
      /><br /><br />

      <label class="mb-0 ml-0 star">Phone Number</label><br />
      <input
        type="number"
        name="mobile_no"
        placeholder="Phone Number"
        class="p-1 outline"
        required
      /><br /><br />

      <label class="mb-0 ml-0 star">Founder Email</label><br />
      <input
        type="email"
        id="member_Email"
        name="member_Email"
        placeholder="Email"
        class="p-1 outline"
        required
      /><br /><br />

      <label class="mb-0 ml-0">LinkedIn URL</label><br />
        <input
        type="text"
        name="linkedin_url"
        placeholder="LinkedIn URL"
        class="p-1 outline"
      /><br /><br />

    </div>

    <div class="col-md-6">
      <label class="mb-0 ml-0 star">Job Title</label><br />
      <input
        type="text"
        name="job_title"
        placeholder="Job Title"
        class="p-1 outline"
        required
      /><br /><br />

      <label class="mb-0 ml-0 star">Password</label><br />
      <input
        type="password"
        name="password"
        id="o-pass"
        placeholder="Password"
        class="p-1 outline"
        required
      /><br /><br />

      <label class="mb-0 ml-0 star">Confirm Password</label><br />
      <input
        type="password"
        name="confirm_password"
        id="c-pass"
        placeholder="Confirm Password"
        class="p-1 outline"
        required
      />
      <div class="form-text">
        <ul>
            <li> Password should atleast be 8 characters long.</li>
            <li>It must contain both capital and small letters.</li>
            <li>It should have atleast one symbol and one number</li>
            <li>It must not contain spaces.</li>
        </ul>
      </div>
      <br /><br />
    </div>
  </div>
  <div class="row">
    <div class="col-md-12 text-center mb-3 mt-lg-5 mt-4">
      <input
        type="submit"
        class="btn btn-warning py-2 px-5"
        value="Submit"
      />
    </div>
  </div>
</form>`;

  document.getElementById('member_Email').value = startupRegData.startupDetails.email_personal;
  document.getElementById('o-pass').pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.source;
  document.getElementById('c-pass').pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.source;

  const checkFounderFormPass = () => {
    var password = document.getElementById("o-pass");
    var confirm_password = document.getElementById("c-pass");

    function validatePassword() {
      if (password.value != confirm_password.value) {
        confirm_password.setCustomValidity("Passwords Don't Match");
      } else {
        confirm_password.setCustomValidity('');
      }
    }

    password.onchange = validatePassword;
    confirm_password.onkeyup = validatePassword;
  }
  checkFounderFormPass();

  const founderForm = document.getElementById("founder-reg-form");
  founderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    startupRegData.founderDetails.member_name = founderForm.elements.member_name.value;
    startupRegData.founderDetails.mobile_no = parseInt(founderForm.elements.mobile_no.value);
    startupRegData.founderDetails.member_Email = founderForm.elements.member_Email.value;
    startupRegData.founderDetails.password = founderForm.elements.password.value;
    startupRegData.founderDetails.confirm_password = founderForm.elements.confirm_password.value;
    startupRegData.founderDetails.linkedin_url = founderForm.elements.linkedin_url.value;

    startupRegData.jobDetails.job_title = founderForm.elements.job_title.value;

    if (startupRegData.founderDetails.password != startupRegData.founderDetails.confirm_password) {
      alert("Passwords do not match");
      throw new Error("Passwords do not match");
    }

    fetch(api_startupRegister, {
      method: "POST",
      body: JSON.stringify(startupRegData),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => {
        if (res.redirected) {
          alert("Successfully Registered ! You will be redirected to the Login Page.\nClick Ok to continue");
          // setTimeout(()=>{
          window.location.href = res.url;
          // },3000)
        }
        if (res.status === 400) {
          res.json().then((data) => {
            alert(`${JSON.stringify(data)}`)
          })
        }
      })
      .catch((err) => {
        alert(err);
      });
  });
});
