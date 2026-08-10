import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="info-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      <div className="header-spacer" style={{ height: '70px' }} />

      <section className="info-hero">
        <h1 className="info-hero-title">Privacy Policy</h1>
        <p className="info-hero-subtitle">How we collect, use, and protect your personal data across the FitBox Sports website and the FitBox mobile app.</p>
      </section>

      <div className="info-container">
        <div className="info-card">
          <div className="info-section-head">
            <h2 className="info-title">Privacy Policy</h2>
            <span className="info-date">Last Updated: 11 August 2026</span>
          </div>

          <div className="info-body">
            <p>
              This policy explains what <strong>FitBox Sports</strong> ("we", "us") collects, why, and what
              you can do about it. It covers both <strong>www.fitboxsports.in</strong> and the
              <strong> FitBox mobile app</strong> for Android and iOS. The website and the app share one
              account and one rewards wallet, so information you provide in one is visible in the other.
            </p>
            <p>
              We are a sports and gym equipment distributor based in <strong>Jalandhar, Punjab, India</strong>.
              Contact us any time at <a href="mailto:fitboxsports01@gmail.com">fitboxsports01@gmail.com</a>.
            </p>

            <h2>1. Information We Collect</h2>

            <h3>Account information</h3>
            <ul>
              <li><strong>Identity and contact details</strong> — name, email address, phone number and shipping address, provided when you create an account or place an order.</li>
              <li><strong>Authentication data</strong> — if you use "Continue with Google", Google confirms your email address and name to us. We never receive your Google password.</li>
              <li><strong>Password</strong> — stored only as a secure one-way hash. We cannot read it.</li>
            </ul>

            <h3>Location and activity data (mobile app only)</h3>
            <ul>
              <li>
                <strong>Precise GPS location</strong>, collected <em>only while you are actively recording a
                run</em>. Recording continues while the app is in the background or your screen is off, so
                that a run is not lost when you pocket your phone; Android shows a permanent notification for
                the whole time this is happening. We do not track your location at any other time, and there
                is no background tracking when you are not recording.
              </li>
              <li><strong>Route, distance, pace, duration and calories</strong> for each run you record.</li>
              <li><strong>Step count and motion data</strong> from your device's motion sensor, used for in-app activity figures.</li>
              <li>
                <strong>We do not read data from Apple Health or Google Health Connect</strong>, and we do not
                request those permissions. Every activity figure in the app comes from a run you recorded in
                the app itself.
              </li>
            </ul>

            <h3>Device and usage data</h3>
            <ul>
              <li><strong>Push notification token</strong> — an anonymous device identifier issued by Firebase Cloud Messaging, used to send you alerts. Removed when you sign out or disable notifications.</li>
              <li><strong>Technical logs</strong> — IP address, device type and timestamps, recorded by our hosting providers for security and reliability.</li>
            </ul>

            <h3>Payment information</h3>
            <p>
              Card and UPI details are entered directly with our payment provider and are processed by them.
              <strong> We never see or store your full card number.</strong> We keep only the order amount,
              payment status and a transaction reference.
            </p>

            <h2>2. What Other People Can See</h2>
            <p>
              The app includes a shared territory map. Please read this section before recording runs.
            </p>
            <ul>
              <li>
                <strong>The territory you claim is visible to other FitBox players</strong>, shown on a shared
                map alongside <strong>your display name</strong> and the size of the area you hold. Territory
                is derived from the routes you run, so the shape of the land you hold reflects roughly where
                you have run.
              </li>
              <li>
                Your individual runs, your route traces, your pace, your wallet balance, your email address
                and your contact details are <strong>never</strong> shown to other users.
              </li>
              <li>
                If you would rather not have any area associated with you publicly, do not record runs in the
                app — the rest of the app and your wallet work without it.
              </li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To create and secure your account and keep you signed in.</li>
              <li>To process, fulfil, ship and track your orders, and to handle returns and refunds.</li>
              <li>To record your runs, calculate territory, rank players and award weekly rewards.</li>
              <li>To operate the rewards wallet and apply points you choose to redeem at checkout.</li>
              <li>To send you service notifications you have enabled — for example when your territory is contested, when a season's results are decided, or about an order.</li>
              <li>To provide customer support and respond to your enquiries.</li>
              <li>To detect, investigate and prevent fraud, cheating and abuse of the rewards programme.</li>
              <li>To improve our products and the app, using aggregated figures that do not identify you.</li>
            </ul>

            <h2>4. Legal Basis and Consent</h2>
            <p>
              We process your account and order information to perform our contract with you. Location and
              motion collection happens <strong>only after you grant the permission</strong>, and you can
              withdraw it at any time in your device settings — the app continues to work, but run recording
              and territory will not function. Marketing messages, where sent, are on the basis of consent
              you can withdraw.
            </p>

            <h2>5. Information Sharing</h2>
            <p><strong>We do not sell, rent or trade your personal information.</strong> We share it only with service providers who help us operate, and only as far as they need it:</p>
            <ul>
              <li><strong>MongoDB Atlas</strong> — database hosting.</li>
              <li><strong>Vercel</strong> — application and API hosting.</li>
              <li><strong>Google (Firebase &amp; Maps)</strong> — push notification delivery, sign-in and map display.</li>
              <li><strong>PhonePe</strong> — payment processing.</li>
              <li><strong>Delhivery</strong> — shipping and delivery tracking.</li>
            </ul>
            <p>
              We may also disclose information where required by law, or to protect our rights, safety, or the
              integrity of the rewards programme.
            </p>

            <h2>6. Data Retention</h2>
            <ul>
              <li><strong>Account, order and wallet records</strong> — kept while your account is active and afterwards where required for tax, accounting and legal purposes.</li>
              <li><strong>Runs and routes</strong> — kept until you delete them or close your account. You can delete an individual run in the app at any time.</li>
              <li><strong>Territory</strong> — competition seasons run weekly; past seasons are retained as historical records of results.</li>
              <li><strong>Push tokens</strong> — removed when you sign out or turn notifications off.</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>You can, at any time:</p>
            <ul>
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Correct</strong> your name, contact details and addresses from your account page.</li>
              <li><strong>Delete</strong> individual runs from the app, or request deletion of your account and associated personal data.</li>
              <li><strong>Withdraw location permission</strong> in your device settings.</li>
              <li><strong>Turn off notifications</strong> in the app or your device settings.</li>
              <li><strong>Object</strong> to how we use your data, or ask for a copy of it.</li>
            </ul>
            <p>
              To exercise any of these, email <a href="mailto:fitboxsports01@gmail.com">fitboxsports01@gmail.com</a> from
              your registered address. To request account deletion, use the subject line "Delete my account".
              We aim to respond within 30 days. Note that deleting your account forfeits any unredeemed
              reward points, which have no cash value.
            </p>

            <h2>8. Security</h2>
            <p>
              All traffic between the app, the website and our servers is encrypted in transit (HTTPS).
              Passwords are stored only as one-way hashes. Your sign-in token is held in your device's
              encrypted secure storage. Access to production systems is restricted, and wallet balances can
              only be changed by our servers — never directly by an app or a browser.
            </p>
            <p>
              No system is completely secure. If we become aware of a breach affecting your personal data, we
              will notify you and the relevant authorities as required by law.
            </p>

            <h2>9. Children</h2>
            <p>
              FitBox is not intended for children under 13, and we do not knowingly collect their personal
              data. If you believe a child has provided us with personal information, contact us and we will
              delete it. Users under 18 should have a parent or guardian's permission before recording runs
              or making purchases.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this policy as the product changes. The "Last Updated" date above always reflects
              the current version, and material changes will be notified in the app or by email.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              Questions, requests or complaints about this policy or your data:<br />
              <strong>FitBox Sports</strong>, Jalandhar, Punjab, India<br />
              Email: <a href="mailto:fitboxsports01@gmail.com">fitboxsports01@gmail.com</a><br />
              WhatsApp: <a href="https://wa.me/8568989898" target="_blank" rel="noreferrer">+91 85689 89898</a><br />
              Instagram: <a href="https://www.instagram.com/fitbox.sports/" target="_blank" rel="noreferrer">@fitbox.sports</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
