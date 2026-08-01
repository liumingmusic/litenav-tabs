import React from 'react';
import { Modal } from "./Modal";
import { LinkItem } from "../lib/store";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkItem: LinkItem | null;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, linkItem }) => {
  if (!linkItem) return null;

  return (
    <Modal className="max-w-4xl" isOpen={isOpen} onClose={onClose} title={`说明 - ${linkItem.title}`}>
      <div className="flex flex-col max-h-[70vh]">
        {linkItem.note ? (
          <div className="overflow-y-auto pr-2 custom-scrollbar">
            <div className="prose prose-sm prose-blue max-w-none text-gray-700 break-words">
              <Markdown remarkPlugins={[remarkGfm]}>
                {linkItem.note}
              </Markdown>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-400 text-sm">
            暂无说明内容
          </div>
        )}
        <div className="mt-6 flex justify-end shrink-0 border-t border-gray-100 pt-4">
           <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </Modal>
  );
};
