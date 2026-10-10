"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Input, Modal, Badge } from "@/components/ui";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-2xl bg-surface-white p-8 shadow-card border border-surface-border">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo.png"
            alt="Up Speaking Logo"
            width={180}
            height={60}
            priority
            className="h-auto w-auto max-h-16"
          />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Up Speaking Learning Centre
        </h1>
        <p className="text-text-muted text-sm mb-6">
          Sistem Informasi Tes Penempatan Berbasis Web Menggunakan Algoritma Fisher-Yates Shuffle
        </p>

        {/* Badges Test */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>

        {/* Buttons Test */}
        <div className="flex flex-col gap-3">
          <Button onClick={() => setIsModalOpen(true)}>
            Buka Modal Uji Coba
          </Button>
          <Button variant="accent">
            Tombol Aksen Merah
          </Button>
        </div>
      </div>

      {/* Modal Dialog Test */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Uji Komponen Modal"
        description="Modal dasar menggunakan animasi Framer Motion."
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Nama Lengkap Siswa"
            placeholder="Contoh: Budi Pratama"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            helperText="Pastikan nama sesuai dengan yang didaftarkan staf."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
