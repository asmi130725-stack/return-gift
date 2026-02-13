import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const { positionX, positionY, width, height, scale, rotation, cropData } = body

    const updateData: any = {}
    if (positionX !== undefined) updateData.position_x = Math.round(positionX)
    if (positionY !== undefined) updateData.position_y = Math.round(positionY)
    if (width !== undefined) updateData.width = Math.round(width)
    if (height !== undefined) updateData.height = Math.round(height)
    if (scale !== undefined) updateData.scale = scale
    if (rotation !== undefined) updateData.rotation = rotation
    if (cropData !== undefined) updateData.crop_data = cropData

    const { data, error } = await supabase
      .from('photos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating photo position:', error)
    return NextResponse.json(
      { error: 'Failed to update photo position' },
      { status: 500 }
    )
  }
}
