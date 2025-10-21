import React from 'react'

export function usePics(setFormData) {
  const addPic = React.useCallback(() => {
    setFormData(prev => ({
      ...prev,
      pics: [
        ...prev.pics,
        { id: `pic-${Date.now()}`, name: '', title: '', phone: '', email: '', birthPlace: '', birthDate: '', education: '', hobbies: '', relationshipStatus: '', decisionRole: '', avatar: null },
      ],
    }))
  }, [setFormData])

  const updatePic = React.useCallback((idx, key, value) => {
    setFormData(prev => ({
      ...prev,
      pics: prev.pics.map((p, i) => (i === idx ? { ...p, [key]: value } : p)),
    }))
  }, [setFormData])

  const removePic = React.useCallback((idx) => {
    setFormData(prev => ({
      ...prev,
      pics: prev.pics.filter((_, i) => i !== idx),
    }))
  }, [setFormData])

  const movePic = React.useCallback((from, to) => {
    setFormData(prev => {
      const arr = [...prev.pics]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return { ...prev, pics: arr }
    })
  }, [setFormData])

  return { addPic, updatePic, removePic, movePic }
}
