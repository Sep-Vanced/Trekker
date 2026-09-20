import Sidebar from "./Sidebar";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen bg-[#F4F4F4] font-[Sora,sans-serif]" >
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen overflow-x-hidden overflow-y-auto">
        <div className="px-8 py-2">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;