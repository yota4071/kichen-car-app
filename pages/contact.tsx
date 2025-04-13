// pages/contact.tsx
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Layout from "@/components/Layout";
import NoticeBanner from "@/components/NoticeBanner";
import { 
  FormGroup, 
  FormLabel, 
  FormInput, 
  FormSelect,
  FormTextarea
} from "@/components/ui/form";
import Button from "@/components/ui/Button";
import SuccessMessage from "@/components/ui/SuccessMessage";

type FormData = {
  name: string;
  email: string;
  category: string;
  message: string;
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    category: "general",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  
  // お問い合わせカテゴリーのオプション
  const categoryOptions = [
    { value: "general", label: "一般的なお問い合わせ" },
    { value: "bug", label: "不具合の報告" },
    { value: "feature", label: "機能リクエスト" },
    { value: "shop", label: "キッチンカー掲載について" },
    { value: "other", label: "その他" }
  ];

  // 入力値の変更を処理する関数
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // テキストエリアの変更を処理する関数
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setCharacterCount(value.length);
  };

  // バリデーション関数
  const validateForm = (): boolean => {
    // 名前が入力されているか
    if (!formData.name.trim()) {
      setSubmitError("名前を入力してください");
      return false;
    }
    
    // メールアドレスの形式が正しいか
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError("有効なメールアドレスを入力してください");
      return false;
    }
    
    // お問い合わせ内容が入力されているか
    if (!formData.message.trim()) {
      setSubmitError("お問い合わせ内容を入力してください");
      return false;
    }
    
    // お問い合わせ内容が長すぎないか（1000文字以内）
    if (formData.message.length > 1000) {
      setSubmitError("お問い合わせ内容は1000文字以内で入力してください");
      return false;
    }
    
    return true;
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    // バリデーションチェック
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Firestoreに保存
      await addDoc(collection(db, "inquiries"), {
        name: formData.name,
        email: formData.email,
        category: formData.category,
        message: formData.message,
        status: "new", // ステータス（新規）
        createdAt: serverTimestamp()
      });
      
      // 成功時の処理
      setSubmitSuccess(true);
      // フォームをリセット
      setFormData({
        name: "",
        email: "",
        category: "general",
        message: ""
      });
      setCharacterCount(0);
      
      // 3秒後に成功メッセージを非表示
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError("送信中にエラーが発生しました。しばらく経ってからもう一度お試しください。");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="お問い合わせ | キッチンカー探し">
      <div className="container py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">お問い合わせ</h1>
          
          <NoticeBanner
            title="お問い合わせについて"
            message="通常2〜3営業日以内にご入力いただいたメールアドレスに返信いたします。"
          />
          
          <div className="mt-8">
            {submitError && (
              <div className="error-message bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6">
                {submitError}
              </div>
            )}
            
            {submitSuccess && (
              <SuccessMessage>
                お問い合わせを受け付けました。
              </SuccessMessage>
            )}
            
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel htmlFor="name" required>お名前</FormLabel>
                <FormInput
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="山田 太郎"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="email" required>メールアドレス</FormLabel>
                <FormInput
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@mail.com"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="category">お問い合わせ分類</FormLabel>
                <FormSelect
                  id="category"
                  name="category"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="message" required>お問い合わせ内容</FormLabel>
                <FormTextarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleTextareaChange}
                  placeholder="お問い合わせ内容をご記入ください"
                  rows={6}
                  required
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  <span className={characterCount > 800 ? "text-amber-600" : ""}>
                    {characterCount}
                  </span>/1000
                </div>
              </FormGroup>
              
              <div className="mt-8 flex justify-center">
                <Button
                  type="submit"
                  variant="primary"
                  className="px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "送信中..." : "送信する"}
                </Button>
              </div>
            </form>
          </div>
          

          {/*
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">その他のお問い合わせ方法</h2>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-4">
                <h3 className="font-medium text-gray-700">電話でのお問い合わせ</h3>
                <p className="text-gray-600">平日 10:00〜17:00</p>
                <p className="text-lg font-medium mt-1">075-XXX-XXXX</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">メールでのお問い合わせ</h3>
                <p className="text-gray-600">24時間受付</p>
                <p className="text-lg font-medium mt-1">support@example.com</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            お問い合わせいただいた内容は、サービスの改善や今後のご連絡のために使用させていただきます。
          </div> */}
        </div>
      </div>
    </Layout>
  );
}