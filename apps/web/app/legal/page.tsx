import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal — Gambit",
  description:
    "Terms of Service and Privacy Policy for Gambit by Snowkey Studios.",
};

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-amber-100">
        Terms of Service &amp; Privacy Policy
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Effective date: 16 February 2026
      </p>

      {/* Table of contents */}
      <nav className="mb-10 rounded-lg bg-gray-800/50 p-4">
        <p className="mb-2 text-sm font-semibold text-gray-300">Contents</p>
        <ul className="flex flex-col gap-1.5">
          <li>
            <a
              href="#terms"
              className="text-sm text-amber-400 transition-colors hover:text-amber-300"
            >
              Terms of Service
            </a>
          </li>
          <li>
            <a
              href="#privacy"
              className="text-sm text-amber-400 transition-colors hover:text-amber-300"
            >
              Privacy Policy
            </a>
          </li>
        </ul>
      </nav>

      {/* ================================================================== */}
      {/* TERMS OF SERVICE                                                    */}
      {/* ================================================================== */}
      <section id="terms" className="mb-16 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-bold text-amber-100">
          Terms of Service
        </h2>

        {/* 1. Acceptance of Terms */}
        <h3 className="mb-2 text-lg font-semibold text-gray-200">
          1. Acceptance of Terms
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          By accessing or using Gambit (&ldquo;the Service&rdquo;), you agree to
          be bound by these Terms of Service. The Service is operated by
          SNOWKEY&nbsp;STUDIOS&nbsp;PTY&nbsp;LTD (ABN&nbsp;97&nbsp;686&nbsp;558&nbsp;798),
          an Australian company (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;Snowkey Studios&rdquo;). If you do not agree to these terms,
          you must not use the Service. You must be at least 13&nbsp;years of
          age to use the Service. If you are under 18, you represent that you
          have your parent or guardian&rsquo;s consent to use the Service.
        </p>

        {/* 2. Account Terms */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          2. Account Terms
        </h3>
        <p className="mb-2 text-sm leading-relaxed text-gray-400">
          When you create an account with us, you agree to the following:
        </p>
        <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activity that occurs under your
            account.
          </li>
          <li>
            Each person may maintain only one account. Accounts are
            non-transferable.
          </li>
          <li>
            You must provide accurate and complete information when creating your
            account.
          </li>
          <li>
            You must notify us promptly of any unauthorised use of your account.
          </li>
          <li>
            We reserve the right to suspend or terminate accounts that violate
            these terms.
          </li>
        </ul>

        {/* 3. Acceptable Use */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          3. Acceptable Use
        </h3>
        <p className="mb-2 text-sm leading-relaxed text-gray-400">
          You agree not to:
        </p>
        <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>
            Use cheats, exploits, automation software, bots, or any
            unauthorised third-party tools that interact with the Service.
          </li>
          <li>
            Engage in harassment, abuse, threats, or unsportsmanlike behaviour
            towards other users.
          </li>
          <li>
            Attempt to disrupt or interfere with the Service or its
            infrastructure.
          </li>
          <li>
            Impersonate any person or entity, including Snowkey Studios staff or
            other players.
          </li>
          <li>
            Use the Service for any unlawful purpose or in violation of any
            applicable laws or regulations.
          </li>
        </ul>

        {/* 4. Intellectual Property */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          4. Intellectual Property
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          All content, game assets, code, graphics, designs, and other materials
          comprising the Service are the intellectual property of Snowkey Studios
          or its licensors and are protected by Australian and international
          copyright, trademark, and other intellectual property laws. The
          &ldquo;Gambit&rdquo; name and associated branding are trademarks of
          Snowkey Studios. You may not reproduce, distribute, modify, or create
          derivative works from any part of the Service without our prior
          written consent.
        </p>

        {/* 5. User-Generated Content */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          5. User-Generated Content
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          Usernames and other content you create must not be offensive,
          misleading, or infringe upon the rights of others. We reserve the
          right to remove or modify inappropriate usernames or content at our
          sole discretion and without prior notice.
        </p>

        {/* 6. Service Availability */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          6. Service Availability
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; basis. We do not guarantee that the Service will be
          uninterrupted, secure, or error-free. Scheduled maintenance, updates,
          and unforeseen technical issues may temporarily disrupt the Service. We
          reserve the right to modify, suspend, or discontinue any feature of
          the Service at any time, with or without notice.
        </p>

        {/* 7. Disclaimers */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          7. Disclaimers
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          To the maximum extent permitted by law, Snowkey Studios disclaims all
          warranties, whether express, implied, or statutory, including but not
          limited to implied warranties of merchantability, fitness for a
          particular purpose, and non-infringement. We make no representations
          or warranties regarding the accuracy, reliability, or completeness of
          any content provided through the Service.
        </p>

        {/* 8. Limitation of Liability */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          8. Limitation of Liability
        </h3>
        <p className="mb-2 text-sm leading-relaxed text-gray-400">
          To the extent permitted by law, including the Australian Consumer Law
          (Schedule&nbsp;2 of the Competition and Consumer Act&nbsp;2010 (Cth)),
          Snowkey Studios shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages, or any loss of profits,
          data, or goodwill arising out of or in connection with your use of the
          Service.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          Nothing in these terms excludes, restricts, or modifies any consumer
          guarantee, right, or remedy conferred on you by the Australian
          Consumer Law or any other applicable law that cannot be excluded,
          restricted, or modified by agreement.
        </p>

        {/* 9. Governing Law */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          9. Governing Law
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          These Terms of Service are governed by and construed in accordance with
          the laws of Australia. You agree to submit to the non-exclusive
          jurisdiction of the courts of Australia for the resolution of any
          disputes arising out of or in connection with these terms or the
          Service.
        </p>

        {/* 10. Changes to Terms */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          10. Changes to Terms
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          We may update these Terms of Service from time to time. Changes will
          be posted on this page with an updated effective date. Your continued
          use of the Service after any changes constitutes your acceptance of
          the revised terms. We encourage you to review this page periodically.
        </p>

        {/* 11. Contact */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          11. Contact
        </h3>
        <p className="text-sm leading-relaxed text-gray-400">
          If you have any questions about these Terms of Service, please contact
          us at{" "}
          <a
            href="mailto:infosnowkeystudios.com"
            className="text-amber-400 transition-colors hover:text-amber-300"
          >
            info@snowkeystudios.com
          </a>{" "}
          or visit{" "}
          <a
            href="https://snowkeystudios.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 transition-colors hover:text-amber-300"
          >
            snowkeystudios.com
          </a>
          .
        </p>
      </section>

      <div className="my-8 border-t border-gray-800" />

      {/* ================================================================== */}
      {/* PRIVACY POLICY                                                      */}
      {/* ================================================================== */}
      <section id="privacy" className="mb-16 scroll-mt-20">
        <h2 className="mb-6 text-2xl font-bold text-amber-100">
          Privacy Policy
        </h2>

        {/* 1. Introduction */}
        <h3 className="mb-2 text-lg font-semibold text-gray-200">
          1. Introduction
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          This Privacy Policy describes how
          SNOWKEY&nbsp;STUDIOS&nbsp;PTY&nbsp;LTD
          (ABN&nbsp;97&nbsp;686&nbsp;558&nbsp;798) (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;, or &ldquo;Snowkey Studios&rdquo;) collects, uses,
          discloses, and protects your personal information when you use Gambit
          (&ldquo;the Service&rdquo;). We are committed to handling your
          personal information in accordance with the Australian Privacy
          Act&nbsp;1988 (Cth) and the Australian Privacy Principles (APPs).
        </p>

        {/* 2. Information We Collect */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          2. Information We Collect
        </h3>
        <p className="mb-2 text-sm leading-relaxed text-gray-400">
          We may collect the following types of personal information:
        </p>
        <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>
            <strong className="text-gray-300">Account information:</strong>{" "}
            Email address and username provided during registration.
          </li>
          <li>
            <strong className="text-gray-300">Authentication data:</strong>{" "}
            If you sign in using a third-party provider (e.g. Google), we
            receive basic profile information and authentication tokens as
            facilitated by our authentication provider.
          </li>
          <li>
            <strong className="text-gray-300">Game data:</strong> Game history,
            move records, and match outcomes.
          </li>
          <li>
            <strong className="text-gray-300">Rating data:</strong> Competitive
            ratings, rating deviation, volatility, and total games played, used
            for matchmaking and leaderboards.
          </li>
          <li>
            <strong className="text-gray-300">Technical data:</strong> IP
            address, browser type, device information, and access times collected
            automatically through standard web server logs.
          </li>
          <li>
            <strong className="text-gray-300">Connection data:</strong>{" "}
            Real-time connection metadata used during gameplay sessions. This
            data is transient, held in memory only, and not permanently stored.
          </li>
        </ul>

        {/* 3. How We Use Your Information */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          3. How We Use Your Information
        </h3>
        <p className="mb-2 text-sm leading-relaxed text-gray-400">
          We use your personal information to:
        </p>
        <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>Provide, operate, and maintain the Service.</li>
          <li>
            Create and manage your account and display your public player
            profile.
          </li>
          <li>
            Calculate and update competitive ratings and display leaderboard
            rankings.
          </li>
          <li>Facilitate real-time multiplayer gameplay and matchmaking.</li>
          <li>Improve, personalise, and optimise the Service.</li>
          <li>
            Communicate with you about service updates, security alerts, or
            changes to our terms.
          </li>
          <li>
            Comply with legal obligations and enforce our Terms of Service.
          </li>
        </ul>

        {/* 4. How We Share Your Information */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          4. How We Share Your Information
        </h3>
        <p className="mb-2 text-sm leading-relaxed text-gray-400">
          We may share your information in the following circumstances:
        </p>
        <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>
            <strong className="text-gray-300">Publicly visible data:</strong>{" "}
            Your username, game rating, win rate, and game count are displayed
            publicly on leaderboards and player profiles.
          </li>
          <li>
            <strong className="text-gray-300">Service providers:</strong> We
            share data with third-party providers who help us operate the
            Service (see Section&nbsp;5 below).
          </li>
          <li>
            <strong className="text-gray-300">Legal requirements:</strong> We
            may disclose your information if required to do so by Australian law,
            regulation, or court order.
          </li>
          <li>
            We do not sell, rent, or trade your personal information to third
            parties.
          </li>
        </ul>

        {/* 5. Third-Party Services */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          5. Third-Party Services
        </h3>
        <p className="mb-2 text-sm leading-relaxed text-gray-400">
          The Service relies on the following third-party providers:
        </p>
        <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>
            <strong className="text-gray-300">Supabase:</strong> Provides
            authentication and database services. Stores account data, game
            records, and ratings.
          </li>
          <li>
            <strong className="text-gray-300">Vercel:</strong> Hosts the
            frontend web application. May collect standard web traffic logs.
          </li>
          <li>
            <strong className="text-gray-300">Railway:</strong> Hosts the game
            server. May collect standard server logs.
          </li>
          <li>
            <strong className="text-gray-300">Google:</strong> If you choose to
            sign in with Google, Google may share your email address and basic
            profile information with us.
          </li>
        </ul>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          Each of these providers operates under their own privacy policies. We
          encourage you to review their respective policies.
        </p>

        {/* 6. Cookies and Local Storage */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          6. Cookies and Local Storage
        </h3>
        <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>
            Our authentication system uses browser cookies and local storage to
            maintain your login session.
          </li>
          <li>
            Sound and display preferences are stored in your browser&rsquo;s
            local storage.
          </li>
          <li>
            We do not use third-party advertising or tracking cookies.
          </li>
        </ul>

        {/* 7. Data Retention */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          7. Data Retention
        </h3>
        <ul className="mb-4 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>
            Account data is retained for as long as your account remains active.
          </li>
          <li>
            Game records and ratings are retained indefinitely to maintain the
            integrity of leaderboards and match history.
          </li>
          <li>
            Transient connection data is held in server memory only during
            active gameplay sessions and is not permanently stored.
          </li>
          <li>
            If you request account deletion, we will remove your personal
            information within a reasonable timeframe, subject to any legal
            obligations to retain certain data.
          </li>
        </ul>

        {/* 8. Your Rights */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          8. Your Rights
        </h3>
        <p className="mb-2 text-sm leading-relaxed text-gray-400">
          Under the Australian Privacy Act&nbsp;1988 and the Australian Privacy
          Principles, you have the right to:
        </p>
        <ul className="mb-2 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>
            Access the personal information we hold about you.
          </li>
          <li>
            Request correction of any inaccurate or incomplete personal
            information.
          </li>
          <li>
            Request deletion of your account and associated personal
            information.
          </li>
          <li>
            Make a complaint about our handling of your personal information.
          </li>
        </ul>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          To exercise any of these rights, please contact us using the details
          in Section&nbsp;13. If you are not satisfied with our response, you
          have the right to lodge a complaint with the Office of the Australian
          Information Commissioner (OAIC) at{" "}
          <a
            href="https://www.oaic.gov.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 transition-colors hover:text-amber-300"
          >
            oaic.gov.au
          </a>
          .
        </p>

        {/* 9. Data Security */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          9. Data Security
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          We take reasonable steps to protect your personal information from
          misuse, interference, loss, unauthorised access, modification, and
          disclosure. All data is transmitted over HTTPS. Authentication is
          handled by Supabase using secure password hashing and OAuth protocols.
          However, no method of transmission or storage is completely secure, and
          we cannot guarantee absolute security.
        </p>

        {/* 10. Children's Privacy */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          10. Children&rsquo;s Privacy
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          The Service is not intended for children under the age of 13. We do
          not knowingly collect personal information from children under 13. If
          we become aware that we have collected personal information from a
          child under 13 without parental consent, we will take steps to delete
          that information promptly.
        </p>

        {/* 11. International Data Transfers */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          11. International Data Transfers
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          Our third-party service providers (Supabase, Vercel, and Railway) may
          store and process your data on servers located outside of Australia. Where your personal information is transferred overseas, we take
          reasonable steps to ensure that the recipients of your information
          comply with obligations that are substantially similar to the
          Australian Privacy Principles.
        </p>

        {/* 12. Changes to This Policy */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          12. Changes to This Policy
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated effective date. We encourage you to
          review this page periodically. Your continued use of the Service after
          any changes constitutes your acceptance of the revised policy.
        </p>

        {/* 13. Contact Us */}
        <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-200">
          13. Contact Us
        </h3>
        <p className="text-sm leading-relaxed text-gray-400">
          If you have any questions about this Privacy Policy or wish to
          exercise your rights, please contact us:
        </p>
        <ul className="mt-2 ml-4 list-disc space-y-1 text-sm text-gray-400">
          <li>
            <strong className="text-gray-300">Business:</strong>{" "}
            SNOWKEY STUDIOS PTY LTD
          </li>
          <li>
            <strong className="text-gray-300">ABN:</strong>{" "}
            97&nbsp;686&nbsp;558&nbsp;798
          </li>
          <li>
            <strong className="text-gray-300">Email:</strong>{" "}
            <a
              href="mailto:infosnowkeystudios.com"
              className="text-amber-400 transition-colors hover:text-amber-300"
            >
              info@snowkeystudios.com
            </a>
          </li>
          <li>
            <strong className="text-gray-300">Website:</strong>{" "}
            <a
              href="https://snowkeystudios.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 transition-colors hover:text-amber-300"
            >
              snowkeystudios.com
            </a>
          </li>
        </ul>
      </section>

      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          &larr; Back to Home
        </Link>
      </div>
    </main>
  );
}
