import React from 'react'
import Card from '../ui/Card'
import Tag from '../ui/Tag'
import Button from '../ui/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { FaBookOpen } from 'react-icons/fa'
import { FiArrowLeft } from 'react-icons/fi'

export default function ProfileHeader({ name, code, tag, nipnas, onBack }) {
  const navigate = useNavigate()
  const { id } = useParams()
  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 font-semibold">{name?.[0] || 'C'}</div>
          <div>
            <div className="text-xl md:text-2xl font-semibold text-neutral-900">{name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200">NIPNAS {nipnas}</span>
              {tag && <Tag variant={tag.variant}>{tag.text}</Tag>}
              <button
                type="button"
                onClick={() => navigate(`/customers/${id}/account-profile`)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-[#F0F6FF] text-[#2C5CC5] ring-1 ring-[#CFE0FF] hover:bg-[#E9F2FF]"
              >
                <FaBookOpen className="w-3.5 h-3.5" />
                <span>Account Profile</span>
              </button>
              <span className="text-xs text-neutral-400">{code}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="ring-1 ring-[#2C5CC5] text-[#2C5CC5] bg-[#F0F6FF] hover:bg-[#E9F2FF]">Lihat Riwayat</Button>
          {onBack && (
            <Button variant="back" onClick={onBack}>
              <FiArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
