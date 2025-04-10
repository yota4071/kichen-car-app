import Link from "next/link";

type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string; // ← 調理のタイプを追加
};

export default function ShopCard({ id, name, location, image, type }: Shop) {
  return (
    <Link href={`/shop/${id}`} className="block">
      <div className="border rounded-lg p-4 shadow-md w-full max-w-sm bg-white hover:shadow-lg transition">
        <img src={image} alt={name} className="w-full h-48 object-cover rounded-md" />
        <h2 className="text-xl font-bold mt-2 text-black">{name}</h2>
        <p className="text-black">{location}</p>
        <p className="text-sm text-gray-700 mt-1">調理タイプ: {type}</p>
      </div>
    </Link>
  );
}