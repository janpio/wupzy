import Link from "next/link";

const Footer = () => {
  // const email = "wupzy@wuzpy.com";

  return (
    <footer className="mt-10 h-20 w-full bg-gray-800">
      <div className="flex h-full items-center justify-between px-10">
        <div>
          <p className="text-white">wupzy@wupzy.com</p>
        </div>
        <div>
          <Link href="/terms-of-service" className="ml-2 text-white">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
