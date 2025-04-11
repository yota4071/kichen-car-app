import Image from "next/image";
import Layout from "@/components/Layout";

export default function MapPage() {
  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">キッチンカーマップ</h1>
        <Image
          src="/images/map.png"
          alt="OICキャンパスマップ"
          width={1000}
          height={700}
          className="rounded shadow"
        />
      </div>
    </Layout>
  );
}