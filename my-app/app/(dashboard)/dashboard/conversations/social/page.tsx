import { cookies } from "next/headers";
import Image from "next/image";
import { Mail } from "../components/mail";
import { accounts, mails } from "../data";
import BreadCrumb from "@/components/breadcrumb";


const breadcrumbItems = [{ title: "Social Conversations", link: "/dashboard/conversations/social" }];

export default function SocialMediaPage() {
  const layoutCookie = cookies()?.get("react-resizable-panels:layout");
  const collapsedCookie = cookies()?.get("react-resizable-panels:collapsed");

  let defaultLayout, defaultCollapsed;

  if (layoutCookie?.value) {
    try {
      defaultLayout = JSON.parse(layoutCookie.value);
    } catch (error) {
      console.error("Error parsing layout cookie:", error);
    }
  }

  if (collapsedCookie?.value) {
    try {
      defaultCollapsed = JSON.parse(collapsedCookie.value);
    } catch (error) {
      console.error("Error parsing collapsed cookie:", error);
    }
  }

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <Mail
          accounts={accounts}
          mails={mails}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  );
}
