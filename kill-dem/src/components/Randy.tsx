"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTexts, addText, editText, deleteText } from "@/lib/randy-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function Randy() {
  const [texts, setTexts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [newText, setNewText] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const fetchTexts = useCallback(async () => {
    const fetchedTexts = await getTexts();
    setTexts(fetchedTexts);
  }, []);

  useEffect(() => {
    fetchTexts();
  }, [fetchTexts]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [texts]);

  const handleDoubleClick = () => {
    setIsModalOpen(true);
  };

  const resetModalState = () => {
    setModalType(null);
    setNewText("");
    setEditIndex(null);
  };

  const handleAddNew = async () => {
    if (newText) {
      await addText(newText);
      await fetchTexts();
      resetModalState();
    }
  };

  const handleEdit = async (index: number) => {
    setEditIndex(index);
    setNewText(texts[index]);
    setModalType("edit");
  };

  const handleSaveEdit = async () => {
    if (editIndex !== null) {
      await editText(editIndex, newText);
      await fetchTexts();
      resetModalState();
    }
  };

  const handleDelete = async (index: number) => {
    await deleteText(index);
    await fetchTexts();
    if (texts.length === 1) {
      resetModalState();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        className="flex-grow bg-gray-900 border border-green-800 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer select-none"
        onDoubleClick={handleDoubleClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center px-4 w-full"
          >
            <div className="flex items-start justify-center">
              <Quote className="text-green-500 mr-2 mt-1" size={24} />
              <p className="text-green-400 text-2xl text-left font-bold">
                {texts[currentIndex]}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-green-800 text-green-400">
          <DialogHeader>
            <DialogTitle className="text-green-500">
              {modalType === null
                ? "Choose an action"
                : modalType === "add"
                ? "Add New Text"
                : "Edit Texts"}
            </DialogTitle>
          </DialogHeader>
          {modalType === null && (
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => setModalType("add")}
                className="bg-green-900 text-green-300 hover:bg-green-800"
              >
                Add New
              </Button>
              <Button
                onClick={() => setModalType("edit")}
                className="bg-green-900 text-green-300 hover:bg-green-800"
              >
                Edit Existing
              </Button>
            </div>
          )}
          {modalType === "add" && (
            <>
              <Input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter new text"
                className="bg-gray-800 text-green-400 border-green-800"
              />
              <DialogFooter>
                <Button
                  onClick={handleAddNew}
                  className="bg-green-900 text-green-300 hover:bg-green-800"
                >
                  Submit
                </Button>
                <Button
                  variant="outline"
                  onClick={resetModalState}
                  className="border-green-800 text-green-400 hover:bg-green-900"
                >
                  Back
                </Button>
              </DialogFooter>
            </>
          )}
          {modalType === "edit" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {texts.map((text, index) => (
                  <Card key={index} className="bg-gray-800 border-green-800">
                    <CardContent className="p-4">
                      <p className="mb-2 text-green-400">{text}</p>
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(index)}
                          className="bg-green-900 text-green-300 hover:bg-green-800"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(index)}
                          className="bg-red-900 text-red-300 hover:bg-red-800"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <DialogFooter>
                <Button
                  onClick={resetModalState}
                  className="bg-green-900 text-green-300 hover:bg-green-800"
                >
                  Back
                </Button>
              </DialogFooter>
            </>
          )}
          {editIndex !== null && (
            <>
              <Input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Edit text"
                className="bg-gray-800 text-green-400 border-green-800"
              />
              <DialogFooter>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-green-900 text-green-300 hover:bg-green-800"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditIndex(null)}
                  className="border-green-800 text-green-400 hover:bg-green-900"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
