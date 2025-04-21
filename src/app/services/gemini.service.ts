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
      const prompt = 'Analiza esta imagen y clasifica el material que aparece. Si es plástico o vidrio, responde "inorgánico". Si es cualquier tipo de material orgánico (restos de comida, papel, cartón, hojas, etc.), responde "orgánico". Proporciona SOLO UNA de estas dos palabras como respuesta: "orgánico" o "inorgánico". No incluyas explicaciones adicionales.';
      
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
      return response.text();
    } catch (error) {
      console.error('Error al analizar la imagen:', error);
      throw error;
    }
  }
}