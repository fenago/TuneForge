'use client';

import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  songTitle: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  songTitle, 
  isDeleting = false 
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Close button */}
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            {/* Warning Icon */}
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            
            {/* Content */}
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Delete Song
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "<span className="font-medium text-gray-900">{songTitle}</span>"? 
                  This action cannot be undone and will permanently remove the song from your library.
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full justify-center sm:ml-3 sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Deleting...
                </>
              ) : (
                'Delete Song'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="mt-3 w-full justify-center sm:mt-0 sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
