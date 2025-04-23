import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeImage(base64Image: string) {
    try {
      const prompt = 'Clasifica el residuo que aparece en la imagen. Responde ÚNICAMENTE con la palabra "orgánico" si es un residuo biodegradable (restos de comida, papel, cartón, hojas, etc.) o "inorgánico" si es un residuo no biodegradable (plástico, vidrio, metal, etc.). IMPORTANTE: Tu respuesta debe ser EXACTAMENTE una de estas dos palabras, sin espacios adicionales, signos de puntuación o explicaciones.';
      
      const imageParts = [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        }
      ];

      const result = await this.model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const classification = response.text().trim().toLowerCase();
      
      if (!['orgánico', 'inorgánico'].includes(classification)) {
        throw new Error('Clasificación no válida');
      }
      
      return classification;
    } catch (error) {
      console.error('Error al analizar la imagen:', error);
      throw error;
    }
  }
}